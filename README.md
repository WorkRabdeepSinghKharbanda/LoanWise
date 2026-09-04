# LoanWise

24 loan calculators on one amortization engine. React 19 + TypeScript + Vite + Tailwind v4. No backend, no accounts, no tracking — every figure is computed in the browser.

**Live:** https://loan-calculator-ashen-six.vercel.app

## Calculators

**Loans** — Personal · Car · Home · Gold · EMI · Step-Up EMI · Interest-Only & Balloon
**Property** — Mortgage (escrow + PMI drop-off) · ARM stress test · Affordability · Rent vs Buy · Refinance · Savings goal
**Debt** — Credit card payoff · Debt payoff planner (snowball vs avalanche) · Student loan (income-driven repayment)
**Cars** — Lease vs Buy · True cost of ownership
**Shopping** — Buy Now Pay Later vs financing it
**Tools** — Compare four scenarios · Saved scenarios · "Find my calculator" quiz

## What it does that most calculators don't

- **True APR** — folds origination fees and discount points into an effective rate, the only fair way to compare offers
- **Points buydown** — cost per point, break-even month, and the best choice for how long you'll actually keep the loan
- **Prepayment modelling** — extra monthly, one-off lump sums, an annual bonus, and the biweekly trick, with interest and years saved
- **Payoff goal solver** — name a date, get the payment that hits it
- **Prepay vs invest** — guaranteed interest saved against a projected market return
- **PMI drop-off** and **ARM payment shock**, both marked on the balance chart
- **Tax relief** on mortgage interest, with an annual cap (US itemized / India §24)
- **Rate sensitivity** — payment and lifetime interest at ±1%
- Amortization schedules with **calendar dates**, monthly/yearly views, a **"today's money"** inflation toggle, CSV and PDF export
- Inputs live in the **URL**, so any calculation is a shareable link; scenarios can be **saved locally**
- **⌘K command palette** (press `?` for the shortcut list), light/dark, six currencies, **works offline** (installable PWA)
- **Recently viewed** row on the homepage, a **glossary** for terms like APR/PMI/DTI on hover, and a **rate-context** indicator showing whether your rate is typical for that loan type
- **Chart PNG export** and a clean **printable report** header (shown only when you print or save as PDF)

## Run

```
npm install
npm run dev        # dev server
npm test           # 98 tests — math contracts + a render check for every page
npm run test:watch
npm run build      # tsc -b && vite build -> dist/ (also generates sitemap.xml)
npm run preview    # serve the production build locally
```

## Deploy

Vercel auto-detects the Vite preset; `vercel.json` carries the SPA rewrite, asset caching and security headers.

```
vercel --prod
```

## Ads

Off by default. Flip `enabled` in [src/config/ads.ts](./src/config/ads.ts), add your network's script to `index.html`, and replace the placeholder in [AdSlot](./src/components/AdSlot.tsx). Slot heights are reserved while disabled, so enabling them shifts nothing.

## Structure

See [CLAUDE.md](./CLAUDE.md) for architecture, control flow and conventions.
