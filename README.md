# Orchard Planner

A marketplace and planning tool for growers and nurseries to find and trade
propagable plants — scion wood, rootstock, hardwood cuttings, seeds and divisions —
backed by a real variety and rootstock database.

## Tech stack

- **Next.js 15** (App Router) + React 18
- **Prisma** ORM with **SQLite** (single-file database)
- **next-auth** (credentials) for authentication
- **Tailwind CSS 4** for styling
- **Vitest** (unit) + **Playwright** (end-to-end) for tests
- **SQLite FTS5** for full-text search

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set a strong NEXTAUTH_SECRET (32+ random characters)

# 3. Create and migrate the database, then seed demo data
npx prisma migrate dev
npm run db:seed

# 4. Run the dev server
npm run dev
```

The app is available at <http://localhost:3000>.

### Seed accounts

| Email              | Password      | Role            |
| ------------------ | ------------- | --------------- |
| demo@example.com   | password123   | Verified nursery |
| ruth@example.com   | password123   | Grower          |
| admin@example.com  | password123   | Admin           |

## Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the development server                 |
| `npm run build`        | Production build                             |
| `npm run start`        | Start the production server                  |
| `npm run lint`         | ESLint                                       |
| `npm run typecheck`    | TypeScript type checking                     |
| `npm run test`         | Run unit tests (Vitest)                      |
| `npm run test:e2e`     | Run end-to-end tests (Playwright)            |
| `npm run db:migrate`   | Apply migrations to an existing database     |
| `npm run db:migrate:dev` | Create/apply migrations in development     |
| `npm run db:seed`      | Reset and reseed the demo database           |
| `npm run db:generate`  | Regenerate the Prisma client                 |
| `npm run backup`       | Back up the SQLite database to `backups/`    |

## Configuration

Environment variables (see `.env.example`):

| Variable              | Required          | Notes                                   |
| --------------------- | ----------------- | --------------------------------------- |
| `DATABASE_URL`        | Always            | SQLite file path, e.g. `file:./dev.db`  |
| `NEXTAUTH_SECRET`     | In production     | 32+ random characters                   |
| `NEXTAUTH_URL`        | In production     | Public base URL                         |
| `STRIPE_SECRET_KEY`   | Optional          | Enables Stripe checkout                 |
| `STRIPE_WEBHOOK_SECRET` | Optional        | Enables payment webhooks                |
| `RESEND_API_KEY`      | Optional          | Enables email notifications             |
| `EMAIL_FROM`          | Optional          | From address for email                  |

## Deployment

1. `npm install`
2. Set the required environment variables in production.
3. `npm run db:migrate` (applies migrations) then `npm run db:seed` (optional demo data).
4. `npm run build && npm run start`.

SQLite is a single-file database, so the whole app runs on one host. Back up the
database file (`prisma/dev.db`) regularly. A health-check endpoint is available at
`/api/health`.

> **Note on migrations:** the app uses SQLite FTS5 virtual tables created at runtime
> (outside Prisma). Use `npm run db:migrate` (`prisma migrate deploy`) to apply
> migrations, rather than `prisma migrate dev`, which will report drift from those
> tables.

### Docker

A `Dockerfile` and `docker-compose.yml` are provided:

```bash
docker compose up --build
```

The container runs migrations on startup (and seeds if `SEED_ON_START=true`). The
SQLite database, uploads and backups are persisted in named volumes. Set a real
`NEXTAUTH_SECRET` before exposing it publicly.

## Backups & observability

- `npm run backup` (or `scripts/backup.mjs`) copies the database to `backups/`,
  keeping the 10 most recent. Schedule it with cron for automated backups.
- The admin **System** panel (`/admin/system`) shows runtime info, database size and
  recorded errors, and offers a one-click database download.
- Errors are logged with [pino](https://getpino.io) (JSON logs, `LOG_LEVEL` env var);
  client-side errors are reported to `/api/log` and surfaced in the System panel.

## Testing

- **Unit tests** (`npm run test`) cover pure helpers (pricing, search, spacing,
  polling, rate limiting, upload validation, etc.).
- **End-to-end tests** (`npm run test:e2e`) cover public pages, authentication,
  search and admin flows against a running server.

CI runs typecheck, lint, unit tests, build and E2E on every push and pull request
via `.github/workflows/ci.yml`.

## Security notes

- Server actions enforce ownership checks and are rate-limited (login, registration,
  messaging, listing creation).
- Uploaded images are validated by magic bytes, not just MIME type, and capped at 5MB.
- Security headers (CSP, `X-Frame-Options`, etc.) are applied site-wide.

A `postcss` advisory (in Next's bundled build-time dependency) is reported by
`npm audit` and is only resolvable by upgrading Next to a new major version. It
affects build-time CSS processing only and is not exploitable in this application.
