# Salon Pastel

Salon Pastel is a mobile-first luxury salon booking website built with Vite, React, and TypeScript. The product focuses on a premium first impression, clear service discovery, and a simple appointment request flow.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`

`npm run dev` starts the Vite development server locally on `http://127.0.0.1:5173`.

## Architecture

- `src/app`
  App shell and router
- `src/components/ui`
  Reusable UI primitives
- `src/features/booking/components`
  Booking-specific UI building blocks
- `src/features/booking/screens`
  Routed screens for booking, success, manage, reschedule, and cancel
- `src/features/booking/data`
  Services, add-ons, staff, config, seeded bookings
- `src/features/booking/logic`
  Quote and availability logic
- `src/features/booking/mocks`
  In-memory mock API plus draft/session persistence
- `src/lib`
  Formatting and class utilities
- `docs`
  Mermaid diagrams

## Product Notes

- Locale defaults to `en-GB`
- Salon timezone defaults to `Europe/London`
- Device timezone mismatch is surfaced in the booking funnel
- Draft booking state persists in `localStorage`
- Confirmed mock bookings persist in `sessionStorage`
- Availability includes service duration, add-ons, and cleanup buffer
- Staff filtering updates automatically when the service or add-ons change
- One mock availability request intentionally fails once for retry-state coverage

## Testing Checklist

- Responsive breakpoints from `320px` through desktop
- Keyboard navigation through service cards, calendar, time slots, and review form
- Screen reader pass for landmarks, labels, stepper, and form errors
- Reduced motion preference
- Validation errors on the review form
- Add-on invalidation clearing an incompatible selected time
- Staff unavailability with fallback suggestions
- No-slot day handling with nearby alternatives
- Timezone mismatch note
- Manage booking, reschedule, and cancellation flows
- Performance checks for hero load, route transitions, and image loading

## Deployment

### Local run

1. `npm install`
2. `npm run dev`
3. Open the printed localhost URL

### GitHub

1. Create a new GitHub repository
2. Run `git init`
3. Run `git add .`
4. Run `git commit -m "Initial Salon Pastel app"`
5. Run `git branch -M main`
6. Add your remote with `git remote add origin <repo-url>`
7. Push with `git push -u origin main`

### Cloudflare (free plan, commercial use allowed)

Both sites run on Cloudflare's free plan. Updates don't cost anything, there are no monthly credits that can pause the sites, and static files (the whole customer site) are free and unlimited. The admin's server code runs on Workers' free 100,000 requests a day, far more than one salon needs.

| Site | Address | Cloudflare project | Folder |
| --- | --- | --- | --- |
| Customer booking | https://pastel-salon.pages.dev | Pages `pastel-salon` | `.` (Vite, output `dist`) |
| Owner admin | https://pastel-salon-admin.pages.dev | Worker `pastel-admin` behind Pages `pastel-salon-admin` | `pastel-admin` (Next.js static export) |
| Daily Supabase keep-alive | none | Worker `pastel-keepalive` | `keep-alive` |

- The customer site is a static Pages site; Pages serves `index.html` for every route.
- The admin is a static Next.js export served by a static-assets Worker with no public address of its own. No server code runs per visit: the browser signs in and reads appointments straight from Supabase, and database rules allow only the owner. (A Next.js server went over the free plan's 10 ms CPU limit per request and failed often.) The Pages project in `pastel-admin/pages-proxy` gives it the clean `pages.dev` address and passes every request straight to the Worker.
- Free Supabase projects pause after a week without traffic, so `pastel-keepalive` makes one tiny read every day.
- The public Supabase URL and anon key are in `.env.production` and `pastel-admin/.env.production` (the anon key is public by design; database rules control access), so builds need no dashboard settings.

Every push to `master` deploys both sites automatically (free):

- `pastel-salon` (Pages, connected to this GitHub repo): build command `npm run build`, output `dist`.
- `pastel-admin` (Workers Builds, build token "pastel build token"): root directory `pastel-admin`, build command `npm run build`, deploy command `npx wrangler deploy`.

The keep-alive and the admin front door rarely change and are deployed by hand:

```bash
npx wrangler deploy --config keep-alive/wrangler.jsonc
npx wrangler pages deploy --cwd pastel-admin/pages-proxy
```
