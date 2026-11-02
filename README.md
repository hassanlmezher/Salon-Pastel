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

### Vercel (free Hobby plan)

Both sites are separate Vercel projects connected to this GitHub repo. Every push to `master` redeploys them automatically; other branches get preview URLs.

| Site | Vercel project | Root directory | URL |
| --- | --- | --- | --- |
| Customer booking | `salon-pastel` | `.` (Vite, see `vercel.json`) | https://salon-pastel.vercel.app |
| Owner admin | `salon-pastel-rfxz` | `pastel-admin` (Next.js) | https://salon-pastel-rfxz.vercel.app |

Both need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project settings. Data lives in Supabase (free plan), so the sites keep working when your computer is off.
