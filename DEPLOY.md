# Azure App Service — Deployment Guide

This is the one-time setup to get Bima Buddy live on Azure App Service (Linux, Node 20)
with automatic deploys from GitHub on every push to `master`.

---

## Architecture

```
GitHub master push
   └─► .github/workflows/azure-app-service.yml
         ├─ pnpm install + pnpm build (Next.js standalone output)
         ├─ Zip .next/standalone/
         └─ azure/webapps-deploy@v3 → App Service
                                       └─ Startup: node server.js
```

The Next.js app uses `output: "standalone"` so the deploy package is just `server.js`
plus its trimmed `node_modules` — no `pnpm install` runs on the App Service host.

---

## Step 1 — Create Azure resources (one time, Azure Portal)

You already have: Postgres Flex Server, Storage Account, Azure OpenAI.
You need to add: an App Service Plan + Web App.

### 1.1 Create the App Service Plan
- Portal → **Create a resource** → **App Service Plan**
- Resource group: same as your Postgres / OpenAI
- Name: `bimabuddy-plan`
- Operating System: **Linux**
- Region: **Central India** (or whichever region your Postgres is in)
- Pricing plan: **Basic B1** (₹1,000/mo, no cold starts, supports always-on)
- Click **Review + create** → **Create**

### 1.2 Create the Web App
- Portal → **Create a resource** → **Web App**
- Resource group: same
- Name: `bimabuddy` *(must be globally unique — change if taken; if you change it, update `AZURE_WEBAPP_NAME` in the workflow)*
- Publish: **Code**
- Runtime stack: **Node 20 LTS**
- Operating System: **Linux**
- Region: same as plan
- App Service Plan: pick `bimabuddy-plan`
- Click **Review + create** → **Create**

### 1.3 Configure the Web App
After it's created, open the Web App and do these in **Settings → Configuration**:

#### General Settings tab
- **Startup Command:** `node server.js`
- **Always On:** **On** *(critical — keeps your Postgres pool warm and lets fire-and-forget AI jobs finish)*
- **HTTP version:** 2.0
- **HTTPS Only:** **On**
- Save

#### Application Settings tab — add every key below (Name + Value)

| Name | Value |
|---|---|
| `DATABASE_URL` | your Postgres connection string with `?sslmode=require` |
| `AZURE_STORAGE_CONNECTION_STRING` | from your storage account |
| `AZURE_STORAGE_CONTAINER` | `uploads` |
| `AZURE_OPENAI_ENDPOINT` | `https://bimabuddy-openai.openai.azure.com/` |
| `AZURE_OPENAI_KEY` | from OpenAI resource → Keys |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` |
| `AZURE_OPENAI_API_VERSION` | `2024-04-01-preview` |
| `NEXTAUTH_SECRET` | your 32-byte base64 secret |
| `NEXTAUTH_URL` | `https://bimabuddy.azurewebsites.net` (or your custom domain once added) |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
| `RESEND_API_KEY` | from Resend dashboard |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `help@yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://bimabuddy.azurewebsites.net` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |
| `WEBSITES_PORT` | `3000` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` *(we already built in CI)* |

Click **Save** (top of the page) and let it restart.

### 1.4 Update Google OAuth redirect URI
- Google Cloud Console → APIs & Services → Credentials → your OAuth client
- Authorised redirect URIs: add `https://bimabuddy.azurewebsites.net/api/auth/callback/google`
- Save

### 1.5 Allow Postgres to accept connections from App Service
- Portal → your Postgres flex server → **Settings → Networking**
- Add firewall rule: **Allow public access from any Azure service within Azure to this server** = **ON**
- Save

---

## Step 2 — Create a service principal for GitHub Actions

GitHub needs credentials to push deploys. Easiest: a federated service principal.

**Option A — Run this in Azure Cloud Shell (Bash):**

```bash
# Replace SUBSCRIPTION_ID and RG_NAME first
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
RG_NAME=bimabuddy-rg   # whatever your resource group is called

az ad sp create-for-rbac \
  --name "bimabuddy-github-deploy" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME \
  --sdk-auth
```

Copy the **entire JSON output** — you'll paste it as a GitHub secret named `AZURE_CREDENTIALS`.

**Option B — Portal:**
- Azure Active Directory → App Registrations → New registration → name it `bimabuddy-github-deploy`
- Subscriptions → your sub → Access control (IAM) → Add role assignment → **Contributor** → assign to the SP you just created
- Then use Cloud Shell command above to generate the JSON, OR construct it manually.

---

## Step 3 — Add GitHub secrets

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add ALL of these (same names as the App Service settings — needed at build time too):

| Secret name | Value |
|---|---|
| `AZURE_CREDENTIALS` | The full JSON blob from Step 2 |
| `DATABASE_URL` | Postgres connection string |
| `AZURE_STORAGE_CONNECTION_STRING` | Storage connection string |
| `AZURE_OPENAI_ENDPOINT` | OpenAI endpoint |
| `AZURE_OPENAI_KEY` | OpenAI key |
| `NEXTAUTH_SECRET` | Auth secret |
| `NEXTAUTH_URL` | `https://bimabuddy.azurewebsites.net` |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `NEXT_PUBLIC_SITE_URL` | `https://bimabuddy.azurewebsites.net` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `help@yourdomain.com` |

---

## Step 4 — Push & deploy

```powershell
cd D:\bimabuddy
git add .
git commit -m "Day 5/6: admin dashboard, /about /privacy /terms, SEO, doc downloads, App Service deploy config"
git push origin master
```

- Open GitHub → **Actions** tab → watch "Deploy to Azure App Service" run.
- First deploy takes ~4-6 min (cold cache).
- When it completes: open `https://bimabuddy.azurewebsites.net` 🎉

---

## Step 5 — Verify

1. **Health check** — visit `https://bimabuddy.azurewebsites.net/api/health` → should return JSON.
2. **Login** — `/login` → Sign in with Google → should land on `/onboarding` (first time) or `/triage`.
3. **Admin** — visit `/admin` as your admin user.
4. **SEO** — `/robots.txt` and `/sitemap.xml` should both load.
5. **Logs** — Portal → Web App → **Monitoring → Log stream** to tail real-time logs.

---

## Step 6 — (Later) Add custom domain + SSL

When you buy your domain (e.g. `bimabuddy.in`):

1. Web App → **Settings → Custom domains → Add custom domain**
2. Add CNAME record at your registrar:
   - Host: `www`, Value: `bimabuddy.azurewebsites.net`
   - Plus a TXT record for verification (portal shows you the exact value)
3. Once validated → **Add managed certificate** (free Azure-managed SSL)
4. Set **HTTPS Only** = On (already done)
5. Update these App Service settings:
   - `NEXTAUTH_URL` → `https://bimabuddy.in`
   - `NEXT_PUBLIC_SITE_URL` → `https://bimabuddy.in`
6. Update Google OAuth redirect URI to include the new domain.
7. Update GitHub secrets `NEXTAUTH_URL` + `NEXT_PUBLIC_SITE_URL` to match.

---

## Common gotchas

- **`AUTH_TRUST_HOST` must be `true`** behind App Service's reverse proxy — already set.
- **`SCM_DO_BUILD_DURING_DEPLOYMENT=false`** — without this, Azure tries to run `npm install` on the host (slow and breaks pnpm). We pre-build in CI.
- **`WEBSITES_PORT=3000`** — Next.js standalone server listens on 3000 by default; this tells App Service which port to proxy to.
- **Always On = ON** — without it, fire-and-forget AI jobs get killed mid-run when the app idles.
- **Postgres firewall** — must allow Azure services, or set up VNet integration.
- **First request after deploy is slow (~10s)** — cold start. Normal. `Always On` prevents subsequent slowdowns.

---

## Rollback

If a deploy breaks prod:
- Web App → **Deployment → Deployment Center → Logs** → pick a previous successful run → **Redeploy**

OR

- `git revert <bad-sha> && git push` — workflow redeploys the previous good state.
