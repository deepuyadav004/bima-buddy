import { containerClient } from "@/lib/blob";
import { openai, AZURE_DEPLOYMENT } from "@/lib/openai";

const MIN_TEXT_CHARS = 500;

/**
 * Download a blob to a Buffer.
 */
export async function downloadBlob(blobPath: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const blob = containerClient.getBlobClient(blobPath);
  const props = await blob.getProperties();
  const downloaded = await blob.downloadToBuffer();
  return {
    buffer: downloaded,
    contentType: props.contentType ?? "application/octet-stream",
  };
}

/**
 * Extract text from a PDF buffer. Returns empty string if it fails.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse v2 exports differently than v1; handle both shapes.
    const mod: unknown = await import("pdf-parse");
    const pdfParse = resolvePdfParse(mod);
    if (!pdfParse) {
      console.error("[extract] pdf-parse: could not find a callable export");
      return "";
    }
    const result = await pdfParse(buffer);
    return (result?.text ?? "").trim();
  } catch (err) {
    console.error("[extract] pdf-parse failed:", err);
    return "";
  }
}

type PdfParseFn = (data: Buffer) => Promise<{ text: string }>;

function resolvePdfParse(mod: unknown): PdfParseFn | null {
  if (typeof mod === "function") return mod as PdfParseFn;
  if (mod && typeof mod === "object") {
    const m = mod as Record<string, unknown>;
    if (typeof m.default === "function") return m.default as PdfParseFn;
    if (typeof m.parsePdf === "function") return m.parsePdf as PdfParseFn;
    if (typeof m.pdf === "function") return m.pdf as PdfParseFn;
  }
  return null;
}

/**
 * Use Azure OpenAI Vision to extract text from a PDF or image.
 * Works on scanned PDFs (where pdf-parse returns nothing) and on JPG/PNG.
 */
async function visionOcr(
  buffer: Buffer,
  contentType: string,
  hint: string
): Promise<string> {
  const base64 = buffer.toString("base64");
  const mime = contentType || "application/octet-stream";
  const dataUrl = `data:${mime};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: AZURE_DEPLOYMENT,
    temperature: 0,
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content:
          "You are an OCR engine. Extract ALL visible text from the document, preserving the original structure (headings, sections, tables, lists). Output ONLY the extracted text — no commentary, no markdown formatting beyond what's in the original.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract all text from this ${hint}. Include every number, date, name, code, and clause. If multilingual (English + Hindi), keep both.`,
          },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

/**
 * Smart extract: try pdf-parse first, fall back to Vision OCR for images.
 *
 * Note: Azure OpenAI Vision doesn't accept PDF MIME type — only images.
 * For scanned PDFs we currently surface whatever pdf-parse extracted and
 * add a [NOTE] for the LLM. Proper PDF→PNG rendering is a follow-up.
 */
export async function extractText(
  blobPath: string,
  hint = "insurance document"
): Promise<string> {
  const { buffer, contentType } = await downloadBlob(blobPath);

  const isImage = contentType.startsWith("image/");
  const isPdf = contentType === "application/pdf";

  if (isImage) {
    return visionOcr(buffer, contentType, hint);
  }

  if (isPdf) {
    const text = await extractPdfText(buffer);
    if (text.length >= MIN_TEXT_CHARS) {
      return text;
    }
    // Scanned/image-based PDF. Vision can't accept PDF MIME type.
    // Return whatever we got with a clear NOTE so the LLM knows the doc is partial.
    console.warn(
      `[extract] ${blobPath}: pdf-parse only got ${text.length} chars. PDF likely scanned/image-based.`
    );
    const partial = text.trim();
    return `${partial}\n\n[NOTE TO MODEL: This ${hint} appears to be a scanned/image PDF. Only ${text.length} characters could be extracted via text parsing. If this is too thin to make a confident judgment, set confidence='low' and explain in confidence_reason.]`;
  }

  throw new Error(`Unsupported content type for ${blobPath}: ${contentType}`);
}
