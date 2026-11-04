# Pastel Admin

Separate owner dashboard for the Pastel salon booking system. This app deploys as its own Cloudflare Worker (`pastel-admin`) and uses the same Supabase project as the customer booking website.

## Local Development

```bash
cd pastel-admin
npm install
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:5174`.

## Environment Variables

Use the same Supabase project values as the customer booking site:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
# Optional: where "New appointment" sends you
NEXT_PUBLIC_BOOKING_URL=https://pastel-salon.pages.dev/book
```

Do not add a service role key to this app. The admin dashboard uses Supabase Auth, RLS, and the `admin_update_appointment_status` RPC.
The **New appointment** button opens the customer booking site (`NEXT_PUBLIC_BOOKING_URL`, default `https://pastel-salon.pages.dev/book`), so there is only one booking flow to maintain.

## Supabase Setup

Run `../supabase/admin_dashboard.sql` in the Supabase SQL Editor. Then create an owner account in Supabase Auth and insert that user's id:

```sql
insert into public.owner_users (user_id)
values ('AUTH_USER_UUID_HERE');
```

## Cloudflare Deployment

Live at https://pastel-salon-admin.pages.dev, free plan. The app is a static Next.js export (`next build` writes `out/`) served by the static-assets Cloudflare Worker `pastel-admin`, which has no public address of its own. Login, the appointment list and status changes run in the browser against Supabase; database rules allow only owner accounts. The Pages project in `pages-proxy/` gives it the clean address and passes every request to the Worker. The public Supabase values are in `.env.production`. Pushes to `master` deploy the Worker automatically through Cloudflare Workers Builds (root directory `pastel-admin`); `npm run deploy` deploys by hand and `npm run preview` builds and serves it locally with Wrangler.
