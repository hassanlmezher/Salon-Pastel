# Pastel Admin

Separate owner dashboard for the Pastel salon booking system. It deploys as its own Cloudflare Worker (`pastel-admin`) and uses the same Neon database as the customer booking website (see `../database/schema.sql`).

## Local Development

```bash
cd pastel-admin
npm install
cp .dev.vars.example .dev.vars   # point DATABASE_URL at a Neon test branch
npm run preview
```

Open `http://localhost:5174`.

## Settings

- `DATABASE_URL` (Worker secret): Neon connection for the `pastel_admin` role, which may only run the `admin_*` functions.
- `NEXT_PUBLIC_BOOKING_URL` (optional, build time): where **New appointment** sends you; default `https://pastelsalon.online/book`, so there is only one booking flow to maintain.

## Owner accounts

Owners are rows in the `owners` table with a bcrypt password hash. To set a new password, run as the database owner:

```sql
update owners set password_hash = crypt('NEW-PASSWORD', gen_salt('bf', 10)) where email = 'owner@example.com';
```

## Cloudflare Deployment

Live at https://admin.pastelsalon.online (also https://pastel-salon-admin.pages.dev), free plan. The app is a static Next.js export (`next build` writes `out/`) served by the Cloudflare Worker `pastel-admin`, which has no public address of its own. Pages are static; only `/api/*` runs `worker/index.ts`, which handles sign-in and calls the database. The Pages project in `pages-proxy/` gives it the clean address and passes every request to the Worker. Pushes to `master` deploy the Worker automatically through Cloudflare Workers Builds (root directory `pastel-admin`); `npm run deploy` deploys by hand and `npm run preview` builds and serves it locally with Wrangler.
