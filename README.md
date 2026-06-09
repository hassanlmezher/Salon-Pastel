# Salon Pastel

Salon Pastel is a mobile-first luxury salon booking frontend built with React, TypeScript, Tailwind CSS, Motion, and React Router. The product focuses on a short 3-step booking flow, strong premium visual hierarchy, realistic mock scheduling logic, and accessible guest booking.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

`npm run dev` builds the current app bundle and serves it locally on `http://localhost:5173` where possible.

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

### Vercel

1. Import the GitHub repository into Vercel
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. No required environment variables for the current mock app

Preview deployments will be created automatically for pull requests and branch pushes once the repo is connected.
