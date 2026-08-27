# GridWitness

GridWitness is a frontend-only demo for decentralized electricity-outage monitoring in Nigeria.
Simulated smart meters submit power reports, neighbourhood devices reach consensus, verified
outages appear on a Lagos map, and accurate meters receive demo GRID reward points.

This app currently uses mock data and localStorage only. It does not include a backend, database,
real wallet, AI API, smart contract, or real blockchain transactions yet.

## Stack

- React 19
- TanStack Start and TanStack Router
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Leaflet and OpenStreetMap
- Recharts
- Motion
- Sonner

## Install

```sh
npm install
```

## Development

```sh
npm run dev
```

The local dev server prints its URL in the terminal. In this environment it usually runs at:

```sh
http://127.0.0.1:5173/
```

## Build

```sh
npm run build
```

The production build outputs to `.output/`.

## Lint

```sh
npm run lint
```

The current lint setup may report fast-refresh warnings for files that export components plus
shared helpers. These are warnings, not build blockers.

## Routes

TanStack Router detects these application routes:

- `/`
- `/dashboard`
- `/map`
- `/meters`
- `/outages`
- `/outages/$outageId`
- `/insights`
- `/rewards`

The generated route tree lives in `src/routeTree.gen.ts` and is updated by the TanStack router
plugin during development/build.

## Demo Flow

1. Open `/`.
2. Click `Open Live Dashboard`.
3. Click `Connect Wallet`.
4. Click `Simulate Report`.
5. Click `Use default scenario`.
6. Confirm the default reports:
   - Meter A: Power OFF
   - Meter B: Power OFF
   - Meter C: Power ON
7. Click `Run consensus`.
8. Confirm `67%` consensus is reached.
9. Confirm Yaba is marked as a verified outage.
10. Check that the dashboard, Lagos map, outage list, blockchain activity, and rewards update.
11. Open `/rewards` and claim available GRID demo points.
12. Refresh the page and confirm the demo state persists from localStorage.

## Lovable

This project is connected to Lovable. Avoid rewriting published git history on connected branches:
do not force push, rebase, amend, or squash commits that have already been pushed.
