# Deployment checklist

Launch checklist for Orchard Planner. The app is a Next.js 15 app on a single
SQLite database, so it runs on one host (or a small container). Everything below
is verified by CI (`.github/workflows/ci.yml`), which runs typecheck, lint, unit
tests, build, E2E and a Docker build/smoke-test on every push.

## 1. Pre-flight (local)

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (unit)
- [ ] `npm run build` passes
- [ ] `npm run test:e2e` passes against a production build (`npm run start`)
- [ ] CI is green on `main` for the latest commit

## 2. Environment configuration

Copy `.env.example` to your production env and set every value:

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_URL` | Always | SQLite file path, e.g. `file:/app/prisma/dev.db` |
| `NEXTAUTH_URL` | Always | Public base URL, e.g. `https://orchardplanner.com` |
| `NEXTAUTH_SECRET` | Always | 32+ random characters (`openssl rand -base64 48`) |
| `STRIPE_SECRET_KEY` | Payments | Stripe secret key (live mode) |
| `STRIPE_WEBHOOK_SECRET` | Payments | Webhook signing secret |
| `PLATFORM_FEE_BPS` | Payments | Basis points fee on sales, default `500` (5%) |
| `RESEND_API_KEY` | Email | Resend API key for transactional email |
| `EMAIL_FROM` | Email | Verified from address, e.g. `no-reply@orchardplanner.com` |
| `SEED_ON_START` | Docker only | `false` in production (never seed demo data) |
| `LOG_LEVEL` | Optional | `info` recommended in production |

- [ ] Generate a unique `NEXTAUTH_SECRET`
- [ ] Confirm `NEXTAUTH_URL` matches the production domain exactly
- [ ] Verify the `EMAIL_FROM` sender is verified in Resend
- [ ] Confirm `PLATFORM_FEE_BPS` matches the fee you display in Terms

## 3. Payments (Stripe)

- [ ] Create a Stripe account and enable **Stripe Connect** (Express or Standard)
- [ ] Put the live `STRIPE_SECRET_KEY` in the env
- [ ] Create a webhook endpoint for `payment_intent.succeeded` at
      `https://<your-domain>/api/stripe/webhook`, set `STRIPE_WEBHOOK_SECRET`
- [ ] Sign in as a seller and complete onboarding via Dashboard → "Getting paid"
      (check `/dashboard?connect=ok` after onboarding)
- [ ] Place a test order with a test card (e.g. `4242 4242 4242 4242`) and confirm
      the seller receives the payout minus the platform fee
- [ ] If you sell through the platform, connect the platform owner's own Stripe
      account the same way so platform fees can be collected

## 4. Database

- [ ] Run `npm run db:migrate` (`prisma migrate deploy`) against the fresh DB
- [ ] Do **not** run `prisma migrate dev` in production (FTS5 virtual tables cause
      drift — see README)
- [ ] Never run `npm run db:seed` in production (demo data + demo accounts)
- [ ] Back up the SQLite file (`.env` `DATABASE_URL` target) and uploaded files
      (uploads dir) before and after deploying

## 5. Deploy

Recommended: the Docker image (`Dockerfile` + `docker-compose.yml`), which runs
migrations on startup and persists the database, uploads and backups in volumes.

- [ ] `docker compose up --build -d` (or deploy the image to your host)
- [ ] Set `SEED_ON_START=false`
- [ ] Confirm migrations applied: container starts and serves requests
- [ ] Smoke test: `GET /`, `GET /rootstocks`, `GET /api/health` return 200
- [ ] Confirm uploads persist across container restarts (named volume)
- [ ] Terminate HTTPS at the host/proxy and redirect HTTP → HTTPS
- [ ] Point DNS at the host and verify the site loads on the real domain

## 6. Post-launch checks

- [ ] Register a brand-new account with a real email and complete the verification
      link (not a seed account)
- [ ] Reset your password via the "Forgot password?" flow
- [ ] Place a real order between two accounts and confirm the seller's Stripe
      dashboard shows the payout
- [ ] Confirm email arrives (verification, password reset)
- [ ] Check `/admin` moderation queue works and a banned user is blocked at login
- [ ] Confirm `https://<your-domain>/sitemap.xml` and `robots.txt` load
- [ ] Verify privacy policy and terms are linked in the footer and match your
      contact details (both pages are marked **Draft** — replace the placeholder
      email addresses and effective date before going public)
- [ ] Submit the sitemap to Google Search Console and Bing Webmaster Tools

## 7. Ongoing operations

- [ ] Schedule automated backups (cron): `npm run backup` keeps the 10 most
      recent copies in `backups/`
- [ ] Store backups off-host (download from `/admin/system` or copy the backups
      volume off the server)
- [ ] Watch `/admin/system` for runtime info, database size and logged errors
- [ ] Watch the GitHub Actions badge for CI failures after each change
- [ ] Update the postcss advisory note in README when Next.js resolves it