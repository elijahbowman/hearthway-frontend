# Hearthway frontend

<!-- TODO: replace TODO-USERNAME and TODO-FRONTEND-REPO so the badge points at this repo -->
[![CI](https://github.com/TODO-USERNAME/TODO-FRONTEND-REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/TODO-USERNAME/TODO-FRONTEND-REPO/actions/workflows/ci.yml)

The Angular frontend of Hearthway, a homestay booking platform. The project overview,
demo video, architecture and design decisions are in the
<!-- TODO: replace TODO-USERNAME and TODO-BACKEND-REPO with the real backend repo URL -->
[backend repository's README](https://github.com/TODO-USERNAME/TODO-BACKEND-REPO).

## Highlights

- **Modern Angular:** standalone components, signals for state, the built-in control
  flow (`@if`, `@for`) and functional guards and interceptors.
- **Small first load:** every page except the home page is lazy-loaded, and so are the
  "host your home" and search dialogs (which bring in Leaflet). The initial bundle went
  from 1.49 MB to 1.11 MB, and a production build budget keeps it there.
- **Dates as calendar days:** stays are sent to the API as `YYYY-MM-DD` and handled as
  nights (check-in up to check-out), so time zones can't shift a booking and back-to-back
  stays work. The date logic lives in one small, unit-tested module
  (`shared/date-range.ts`).
- **Pictures by URL:** cards and galleries load scaled, cacheable images from the API
  instead of base64 data in JSON.
- **No tokens in the browser:** login runs on the backend; the app only uses a session
  cookie and Angular's built-in CSRF protection.

## Tech stack

Angular 17, PrimeNG and PrimeFlex, Leaflet with OpenStreetMap, Day.js, Font Awesome;
Karma and Jasmine for tests; nginx in the container image.

## Structure

```
src/app/
├── core/       authentication, route guard, shared models
├── home/       the listing grid
├── tenant/     listing page, booking calendar, search, a guest's bookings
├── landlord/   the "host your home" wizard, a host's listings and reservations
├── layout/     navbar, categories, footer, toasts
└── shared/     reusable components and helpers (cards, dates, picture URLs)
```

`src/assets/scss` contains PrimeNG's Lara theme sources, customised with the app's
colours in `hearthway-variables.scss`.

## Running locally

### Prerequisites
- Node.js 20 (`nvm use` picks it up from `.nvmrc`; Angular 17 doesn't support Node 22)
- The backend running on port 8080 (see its README)

### Commands
- `npm install` to fetch dependencies
- `ng serve`, then open http://localhost:4200. API, login and picture requests are
  proxied to the backend.
- `ng build` for a production build in `dist/hearthway-frontend`
- `npm test` for the unit tests in watch mode, or `npm run test:ci` for a single headless
  run with coverage, as CI does

### In a container
The backend repository's `compose.yaml` builds this app with the `Dockerfile` here and
runs it behind nginx, which serves the build and proxies `/api`, `/oauth2` and `/login`
to the backend. See the backend README ("Everything in containers").

## Known limitations

- Angular 17 and PrimeNG 17 are past end of support. Upgrading means moving to
  PrimeNG's design-token theming, which replaces the Sass theme in `src/assets/scss`.
- Unit tests cover the date logic, the route guard and the services; component
  behaviour is meant to be covered by an end-to-end test of the booking flow, which
  doesn't exist yet.
- Accessibility needs work: cards and categories are clickable `div`s without keyboard
  support, and the primary colour doesn't meet WCAG contrast on white.
