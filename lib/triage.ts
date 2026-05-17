import { z } from "zod";
import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { openai, AZURE_DEPLOYMENT } from "@/lib/openai";
import { extractText } from "@/lib/extract";

// ============================================================
// Verdict schema (must match the prompt's JSON output exactly)
// ============================================================

export const VerdictCategory = z.enum([
  "wrongful_denial",
  "procedural_violation",
  "unfair_clause",
  "documentation_gap",
  "legitimate_denial",
  "fraud_signal",
]);

export const RecommendedAction = z.enum([
  "fight",
  "ombudsman",
  "accept",
  "refuse",
]);

export const VerdictSchema = z.object({
  category: VerdictCategory,
  win_probability: z.number().min(0).max(1),
  plain_explanation: z.string().min(50),
  cited_clauses: z.array(
    z.object({
      source: z.string(),
      citation: z.string(),
      relevance: z.string(),
    })
  ),
  recommended_action: RecommendedAction,
  recommended_action_detail: z.string(),
  insurer_specific_notes: z.string(),
  documents_used: z.object({
    policy: z.boolean(),
    rejection: z.boolean(),
    bills: z.boolean(),
  }),
  confidence: z.enum(["high", "medium", "low"]),
  confidence_reason: z.string(),
});

export type Verdict = z.infer<typeof VerdictSchema>;

// ============================================================
// Prompt loading (cached per process)
// ============================================================

let cachedSystemPrompt: string | null = null;

async function loadSystemPrompt(): Promise<string> {
  if (cachedSystemPrompt) return cachedSystemPrompt;
  const file = path.join(process.cwd(), "lib", "prompts", "triage_v1.md");
  cachedSystemPrompt = await readFile(file, "utf-8");
  return cachedSystemPrompt;
}

// ============================================================
// Main orchestrator: process one case end-to-end
// ============================================================

interface ProcessOptions {
  caseId: string;
  /** If true, skip the "is paid?" gate (admin re-trigger). */
  force?: boolean;
}

export async function processCase({ caseId, force = false }: ProcessOptions) {
  const startedAt = Date.now();
  console.log(`[triage] case=${caseId} starting`);

  // Load case
  const [c] = await db
    .select()
    .from(cases)
    .where(eq(cases.id, caseId))
    .limit(1);

  if (!c) {
    throw new Error(`Case ${caseId} not found`);
  }
  if (!force && c.paymentStatus !== "paid") {
    throw new Error(`Case ${caseId} not paid yet`);
  }
  if (!c.rejectionDocPath || !c.policyDocPath) {
    throw new Error(`Case ${caseId} missing required docs`);
  }

  // Mark as processing
  await db
    .update(cases)
    .set({ aiStatus: "processing", updatedAt: new Date() })
    .where(eq(cases.id, caseId));

  try {
    // Extract text from all available docs (parallel)
    console.log(`[triage] case=${caseId} extracting docs`);
    const [rejectionText, policyText, billsText] = await Promise.all([
      extractText(c.rejectionDocPath, "claim rejection letter"),
      extractText(c.policyDocPath, "health insurance policy"),
      c.billsDocPath
        ? extractText(c.billsDocPath, "hospital bills or discharge summary")
        : Promise.resolve(""),
    ]);

    // Build user message
    const userMessage = buildUserMessage(c, rejectionText, policyText, billsText);

    // Call Azure OpenAI
    console.log(`[triage] case=${caseId} calling OpenAI`);
    const systemPrompt = await loadSystemPrompt();
    const completion = await openai.chat.completions.create({
      model: AZURE_DEPLOYMENT,
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse + validate
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error(
        `OpenAI returned invalid JSON: ${rawContent.substring(0, 200)}...`
      );
    }

    const result = VerdictSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        "Verdict schema validation failed: " +
          result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
      );
    }

    // Store
    const elapsedMs = Date.now() - startedAt;
    await db
      .update(cases)
      .set({
        aiStatus: "done",
        verdictJson: {
          verdict: result.data,
          meta: {
            modelDeployment: AZURE_DEPLOYMENT,
            promptVersion: "triage_v1",
            elapsedMs,
            generatedAt: new Date().toISOString(),
            usage: completion.usage ?? null,
          },
        },
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId));

    console.log(
      `[triage] case=${caseId} done (${elapsedMs}ms) category=${result.data.category} win=${result.data.win_probability}`
    );
    return result.data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[triage] case=${caseId} FAILED:`, msg);
    await db
      .update(cases)
      .set({
        aiStatus: "failed",
        verdictJson: {
          error: msg,
          failedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId));
    throw err;
  }
}

// ============================================================
// User message builder
// ============================================================

function buildUserMessage(
  c: typeof cases.$inferSelect,
  rejectionText: string,
  policyText: string,
  billsText: string
): string {
  const truncate = (s: string, max = 8000) =>
    s.length > max ? s.substring(0, max) + "\n\n[...truncated]" : s;

  return `# Case to analyze

**Insurer:** ${c.insurer}
**Claim amount:** ₹${Number(c.claimAmount).toLocaleString("en-IN")}
**Rejection date:** ${c.rejectionDate}
**Claim type:** ${c.claimType}

---

## REJECTION LETTER (extracted text)
${truncate(rejectionText) || "[document was unreadable]"}

---

## POLICY DOCUMENT (extracted text)
${truncate(policyText, 15000) || "[document was unreadable]"}

---

## BILLS / DISCHARGE SUMMARY (extracted text)
${billsText ? truncate(billsText) : "[not provided]"}

---

Analyze this case and return the JSON verdict per the format in the system prompt. Be honest, be specific, cite real regulations.`;
}
