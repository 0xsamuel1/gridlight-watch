# GridWitness Dashboard

Build a polished, responsive frontend UI for a Web3 hackathon project called GridWitness.

Product overview

GridWitness is a decentralized electricity outage monitoring network for Nigeria.

Simulated smart meters report whether electricity is ON or OFF in their neighbourhood. When most trusted meters agree that power is unavailable, the system verifies the outage and records it on HSK Chain.

An AI agent analyzes reports to:

Predict likely restoration times

Detect suspicious or dishonest meters

Calculate power-reliability scores

Identify outage patterns

Send useful neighbourhood alerts

For now, build only the frontend using realistic mock data. Do not build a backend or smart contract. Structure the code so these can be integrated later.

Tech stack

Use:

React

Vite

TypeScript

Tailwind CSS

shadcn/ui

React Router

Lucide React

Recharts

Leaflet with OpenStreetMap for the Lagos outage map

Framer Motion for subtle animations

Do not use Next.js.

Design direction

Create a professional energy-tech dashboard that feels trustworthy, intelligent and modern.

Use:

Dark navy: #07111F

Electric green: #22C55E

Amber for warnings: #F59E0B

Red for confirmed outages: #EF4444

Blue for predictions and analytics: #3B82F6

White and light grey cards

Subtle grid patterns inspired by electricity networks

Rounded cards

Clean borders and soft shadows

Clear, readable typography

Smooth but minimal animation

Avoid excessive crypto visuals, neon effects, coins and complicated blockchain jargon.

The application must look excellent on desktop, tablet and mobile.

Navigation

Create a responsive application shell with:

GridWitness logo using a small grid or electricity pulse icon

Overview

Live Map

Smart Meters

Outages

AI Insights

Rewards

“Connect Wallet” button

Notification icon

User profile menu

Use a collapsible sidebar on desktop and bottom navigation or a drawer on mobile.

Required pages

1. Landing page

Create a compelling public landing page.

Hero section:

Badge: “Decentralized energy intelligence for Nigeria”

Headline: “Know when the power goes out. Know when it may return.”

Supporting text explaining that GridWitness combines community smart-meter reports, AI predictions and blockchain verification

Primary button: “Open Live Dashboard”

Secondary button: “See How It Works”

Add a live-looking product preview showing a Lagos map with coloured outage markers.

Include these sections:

Real-time outage monitoring

AI restoration predictions

Community-verified reports

Rewards for trusted smart meters

Privacy-first data collection

“How GridWitness Works” with four steps:

Meters detect power status

Reports are signed and submitted

Neighbourhood devices reach consensus

Verified outages are recorded on-chain

User groups: Residents, Businesses, Solar Providers, Researchers and Electricity Distributors

HSK Chain integration section

Final call-to-action

Footer

2. Overview dashboard

Create a dashboard displaying:

Greeting: “Good evening, Samuel”

Current grid status: “3 active outages across monitored areas”

Live Meters: 248

Online Meters: 221

Active Outages: 3

Average Reliability: 68%

Rewards Distributed: 12,480 GRID

Add:

Compact Lagos live map

Current outage list

Electricity availability chart for the last 24 hours

Recent meter reports

AI-generated grid summary

Recent blockchain activity

“Simulate Meter Report” button

Use realistic neighbourhood data from Yaba, Ikeja, Surulere, Lekki and Gbagada.

3. Live outage map

Build an interactive Lagos map using Leaflet and OpenStreetMap.

Display neighbourhood markers with these states:

Green: Electricity available

Red: Verified outage

Amber: Conflicting reports

Blue: Restoration predicted

Grey: Insufficient data

Add filters for:

All areas

Power available

Active outages

Unverified reports

Restored areas

When a marker is selected, open a details panel showing:

Neighbourhood

Current power status

Number of reporting meters

Consensus percentage

Outage start time

Predicted restoration time

Reliability score

Latest verified block

Shortened transaction hash

Use realistic demo data.

4. Smart Meters page

Display meter cards and a table containing:

Meter name

Meter ID

Location

Current power status

Trust score

Last report

Total reports

Rewards earned

Connection status

Include three featured simulated devices:

Meter A — Yaba — Power OFF — Trust score 96%

Meter B — Yaba — Power OFF — Trust score 93%

Meter C — Yaba — Power ON — Trust score 72%

Add:

Search

Status filter

Location filter

Register New Meter button

View Meter Details action

Create a meter details drawer showing its report history, accuracy, rewards and trust-score chart.

5. Outages page

Show all active and previous outage events.

Each outage should display:

Area

Status

Start time

Duration

Number of meter reports

Consensus percentage

AI restoration estimate

Verification status

Blockchain transaction hash

Provide tabs for:

Active

Pending Verification

Restored

All Events

Include a detailed outage page for this demo:

Location: Yaba, Lagos

Status: Verified Outage

Started: 2:10 PM

Reports: 3

Consensus: 67%

Prediction: “Power may return between 4:30 PM and 5:15 PM”

Confidence: 81%

Show an activity timeline from first report through consensus, blockchain verification and predicted restoration.

6. AI Insights page

Create an intelligent analytics interface showing:

AI grid summary

Predicted outage hotspots

Estimated restoration times

Suspicious meter reports

Weekly reliability ranking

Outage-frequency chart

Average outage-duration chart

Neighbourhood comparison

Add insight cards such as:

“Yaba has experienced 18% more outages this week.”

“Meter GW-YB-003 submitted a report that conflicts with nearby devices.”

“Ikeja’s electricity reliability improved by 9%.”

“A possible outage is predicted in Surulere within the next two hours.”

Clearly label predictions as estimates, not guarantees.

7. Rewards page

Show a simple rewards system for meter owners.

Include:

Available rewards

Lifetime rewards

Pending rewards

Trust score

Reward history

Contribution ranking

“Claim Rewards” button

Explain that meters earn demo GRID points for accurate and timely reports.

Show a leaderboard with meter owners, locations, accurate reports and rewards.

Do not present GRID as an actual cryptocurrency. Clearly label it as a demo reward point until blockchain integration is completed.

Main interactive demo

Add a “Simulate Meter Report” modal.

The user should be able to select:

Meter A, Meter B or Meter C

Location

Power ON or Power OFF

Report time

Create the following default scenario:

Meter A reports Power OFF

Meter B reports Power OFF

Meter C reports Power ON

After all reports are submitted:

Show an animated “Analyzing neighbourhood reports” state.

Calculate majority consensus.

Display “67% consensus reached.”

Mark Yaba as a verified outage.

Add the outage to the live map.

Generate an AI restoration estimate.

Show a mock blockchain confirmation.

Reward the accurate reporting meters with GRID points.

Update dashboard statistics and activity.

Show a success toast.

Make this the strongest part of the application because it will be used during the hackathon presentation.

Wallet behaviour

The “Connect Wallet” button should simulate wallet connection.

After connecting:

Display a shortened address such as 0x71A4...82F9

Show “HSK Chain”

Add a wallet dropdown

Allow disconnecting

Do not require a real wallet connection yet.

Blockchain activity

Create realistic but clearly simulated blockchain records for:

Meter registered

Report submitted

Consensus reached

Outage verified

Reward issued

Display shortened transaction hashes with a copy button.

Add code comments where real smart-contract integration will later replace mock functionality.

Reusable components

Create reusable components for:

Sidebar

Mobile navigation

Navbar

Stat card

Status badge

Map marker

Meter card

Outage card

AI insight card

Report simulation modal

Wallet button

Transaction item

Activity timeline

Chart card

Empty state

Loading skeleton

Toast notification

Confirmation modal

Functional requirements

All navigation links and routes must work

Charts must use realistic mock data

Map interactions must work

Filters and search must work

The simulated reporting and consensus flow must work

Dashboard values must update after the simulation

Connect Wallet must work as a mock interaction

Claim Rewards must show a confirmation flow

Copy transaction hash buttons must work

Store demo state in localStorage

Include loading, empty, success and error states

Use accessible labels and good colour contrast

Make every page fully responsive

Important restrictions

Frontend only

No backend

No database

No real AI API

No real blockchain transactions

No authentication service

No payment integration

No unfinished TODO sections

No lorem ipsum

Do not add unnecessary pages

Do not overcomplicate the interface

Create realistic content throughout the application.

After implementation:

Run the project.

Fix all TypeScript and compilation errors.

Verify every route.

Test the meter-report simulation.

Test mobile responsiveness.

Ensure npm install and npm run dev work correctly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/50180e9b-8f4c-488c-984b-b1a0092826c7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
