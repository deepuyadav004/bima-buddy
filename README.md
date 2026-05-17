# Bima Buddy

AI-powered health insurance claim help for India.
₹199 honest verdict → optional dispute service (10% success fee, capped ₹5k).

## Status

- [x] **Day 0** — Azure infra (Postgres, Storage, OpenAI), accounts (OTPless, Resend), local dev environment
- [x] **Day 1** — Foundation: landing page, DB schema, health endpoint, deploy
- [ ] **Day 2** — Auth (OTPless WhatsApp + Google)
- [ ] **Day 3** — Intake (claim form + Azure Blob upload)
- [ ] **Day 4** — AI Triage pipeline (Azure OpenAI)
- [ ] **Day 5** — Result page + admin dashboard
- [ ] **Day 6** — Polish (static pages + emails)
- [ ] **Day 7** — Beta + launch

## Stack

- **Framework:** Next.js 16 + TypeScript + Tailwind v4 + custom shadcn-style UI
- **Database:** Azure Database for PostgreSQL (Drizzle ORM)
- **Storage:** Azure Blob Storage
- **LLM:** Azure OpenAI (GPT-4o or GPT-4.1)
- **Auth:** OTPless (WhatsApp + Google) + NextAuth v5 (Day 2)
- **Email:** Resend
- **Hosting:** Azure Static Web Apps (free tier)

## Local dev

```powershell
# 1. Copy env template and fill in real values
Copy-Item .env.example .env.local
# Then edit .env.local with your Azure / OTPless / Resend credentials

# 2. Install (if not already)
pnpm install

# 3. Generate + run DB migrations against Azure Postgres
pnpm db:generate
pnpm db:migrate

# 4. Start dev server (Turbopack)
pnpm dev

# 5. Verify
# Open http://localhost:3000  -> landing page
# Open http://localhost:3000/api/health  -> {"status":"ok","db":"connected"}
```

## Deploy to Azure Static Web Apps

1. Push this repo to GitHub
2. Azure portal -> Create -> Static Web App -> connect repo
3. Build preset: **Next.js**
4. App location: `/`
5. After provisioning -> Configuration -> add all env vars from `.env.example`
6. Wait ~2 min for GitHub Actions to deploy
7. Open the SWA URL -> landing page should render
8. Test `<your-swa>.azurestaticapps.net/api/health` -> must return `{"db":"connected"}`

## Directory map

```
app/
  page.tsx              landing page
  layout.tsx            root layout, Inter font, Toaster
  globals.css           Tailwind v4 + theme
  login/page.tsx        Day 2 placeholder
  api/
    health/route.ts     smoke test: GET -> {status, db}
components/ui/          Button, Card, Accordion, Sonner (shadcn-style)
lib/
  utils.ts              cn() helper
  db/
    index.ts            Drizzle client (Azure Postgres)
    schema.ts           users, cases tables
drizzle.config.ts       migration config
staticwebapp.config.json Azure SWA settings
.env.example            env template (no secrets - committable)
```

## Day 1 done-checklist

- [ ] `pnpm dev` runs without errors locally
- [ ] http://localhost:3000 renders the landing page
- [ ] http://localhost:3000/api/health returns `{"status":"ok","db":"connected"}`
- [ ] DB tables `users` and `cases` exist (verify via `pnpm db:studio` or DBeaver)
- [ ] Mobile viewport renders correctly (test in DevTools or on actual phone)

After all 5 are green -> push to GitHub -> Day 1 done.

## Notes

- **Sole proprietor mode:** no Pvt Ltd or GSTIN required for V0. Razorpay individual KYC sufficient when payment integration is added (Day 8+).
- **Cost:** All runtime services covered by Azure free credit + free tiers (Supabase-not-used; everything on Azure or Resend free).
- **AI verdict cost per case:** ~₹15-25 in Azure OpenAI tokens; covered by your monthly credit.


