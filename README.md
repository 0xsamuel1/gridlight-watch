# GridWitness

GridWitness is a demo for decentralized electricity-outage monitoring in Nigeria. Simulated smart
meters submit power reports, neighbourhood devices reach consensus, verified outages appear on a
Lagos map, and accurate meters receive demo GRID reward points.

The frontend currently uses mock data and localStorage only. The repo also includes a small
hackathon-ready Solidity contract prototype, but it is not connected to the frontend yet. There is
no backend, database, real wallet connection, AI API, or mainnet deployment.

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
- Hardhat 3
- Solidity 0.8.x

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

## Smart Contract

The contract lives at `contracts/GridWitness.sol`. It supports:

- owner-managed smart meter registration
- one signed report per registered meter per reporting round
- neighbourhood-only rounds, so reports from different locations cannot be mixed
- majority consensus calculation
- outage verification when more than 50% of reports say `PowerStatus.Off`
- verified outage records with location, start time, consensus percentage, and participating meters
- demo GRID reward points for meters that match the majority result
- events for meter registration, report submission, consensus, outage verification, and rewards

Compile the contract:

```sh
npm run contracts:compile
```

Run the unit tests:

```sh
npm run contracts:test
```

Run a local simulated deployment:

```sh
npm run contracts:deploy
```

For a future testnet deployment, copy `.env.example` to `.env`, set `HSK_RPC_URL` and
`DEPLOYER_PRIVATE_KEY`, then run:

```sh
npm run contracts:deploy -- --network hskTestnet
```

Do not deploy this hackathon contract to mainnet until it has been reviewed and audited.

## Contract Model

Each reporting round is identified by a `roundId`. The first meter report sets the round's
neighbourhood location, and later reports must come from meters registered to the same location.
When `finalizeRound(roundId)` is called, the contract compares Power OFF and Power ON reports,
rounds the majority percentage to the nearest whole number, emits `ConsensusReached`, rewards the
meters that matched the majority, and records a verified outage if Power OFF is above 50%.

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
