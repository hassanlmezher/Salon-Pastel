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
| Customer booking | https://pastelsalon.online (also https://pastel-salon.pages.dev) | Pages `pastel-salon` | `.` (Vite, output `dist`) |
| Owner admin | https://admin.pastelsalon.online (also https://pastel-salon-admin.pages.dev) | Worker `pastel-admin` behind Pages `pastel-salon-admin` | `pastel-admin` (Next.js static export) |

- The database is Neon Postgres, project `pastel` (Frankfurt, free plan). `database/schema.sql` holds every table and function. The sites never touch tables: each signs in with its own role (`pastel_booking`, `pastel_admin`) that may only run the functions it needs, and every admin function checks the session itself.
- The customer site is a static Pages site; Pages serves `index.html` for every route.
- Its server code is three Pages Functions in `functions/api/` (services, free times, booking), using the `pastel_booking` role. The connection is the Pages secret `DATABASE_URL`.
- One small Pages Function, `functions/calendar.ts`, serves `/calendar?...` as an `.ics` file so "Add to iPhone Calendar" opens the phone's Calendar. It only formats text from the link; it never reads the database.
- The admin is a static Next.js export served by a Worker with no public address of its own. Pages and files are served without running code; only `/api/*` runs `pastel-admin/worker/index.ts`, which signs the owner in (password checked inside the database, session in an HttpOnly cookie) and calls the `admin_*` functions with the `pastel_admin` role. Its connection is the Worker secret `DATABASE_URL`. (A Next.js server went over the free plan's 10 ms CPU limit per request and failed often, so the pages stay static.) The Pages project in `pastel-admin/pages-proxy` gives it the clean `pages.dev` address and passes every request straight to the Worker.
- Neon sleeps when idle and wakes on the next request (the first request after a quiet spell takes about a second longer), so no keep-alive is needed.
- For local testing, copy `.dev.vars.example` (and `pastel-admin/.dev.vars.example`) to `.dev.vars` and point them at a Neon test branch, never the live one.

Every push to `master` deploys both sites automatically (free):

- `pastel-salon` (Pages, connected to this GitHub repo): build command `npm run build`, output `dist`.
- `pastel-admin` (Workers Builds, build token "pastel build token"): root directory `pastel-admin`, build command `npm run build`, deploy command `npx wrangler deploy`.

The admin front door rarely changes and is deployed by hand:

```bash
npx wrangler pages deploy --cwd pastel-admin/pages-proxy
```
