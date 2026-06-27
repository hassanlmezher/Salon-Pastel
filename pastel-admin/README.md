# Pastel Admin

Separate owner dashboard for the Pastel salon booking system. This app deploys as its own Vercel project and uses the same Supabase project as the customer booking website.

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
```

Do not add a service role key to this app. The admin dashboard uses Supabase Auth, RLS, and the `admin_update_appointment_status` RPC.

## Supabase Setup

Run `../supabase/admin_dashboard.sql` in the Supabase SQL Editor. Then create an owner account in Supabase Auth and insert that user's id:

```sql
insert into public.owner_users (user_id)
values ('AUTH_USER_UUID_HERE');
```

## Vercel Deployment

Create a second Vercel project from the same repository and set the project root directory to `pastel-admin`.

Add the two environment variables above in the new Vercel project settings, deploy, then use the Vercel URL for owner access.
