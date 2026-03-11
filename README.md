# FreightCalc — Carrier Profit Calculator

A day-to-day profitability tool built for freight carriers. Analyze load profitability, estimate trip costs before accepting loads, and track your truck's operating expenses — all in one place.

## Features

### Load Profitability Calculator
Calculate profit on any load with a detailed cost breakdown:
- **Revenue**: linehaul rate, fuel surcharge, accessorial charges (detention, lumper, TONU, layover)
- **Costs**: fuel (based on MPG + price/gal), driver pay (per-mile or % of revenue), tolls, insurance, maintenance, dispatch fees
- **Results**: net profit, profit margin %, revenue/cost/profit per mile, full cost breakdown
- Save and compare calculations over time

### Trip Cost Estimator
Know your numbers before you book the load:
- Enter origin, destination, loaded miles, and deadhead miles
- Get estimated trip cost, minimum acceptable rate, and suggested rate (with 15% profit target)
- Uses your operating cost profile for accurate estimates

### Operating Cost Profile
Set up your truck's real operating costs:
- **Fixed costs**: truck payment, insurance, permits, parking, software
- **Variable costs**: fuel, maintenance, tires, driver pay per mile
- Auto-calculates your break-even cost per mile

### Dashboard
See your profitability at a glance:
- Total loads analyzed, average margin, average RPM, break-even cost
- Visual profit chart of recent loads
- Recent trip estimates

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **localStorage** for persistence (no backend required)
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the calculator.

## No Account Required

All data is stored locally in your browser. No sign-up, no backend, no data leaving your machine.
