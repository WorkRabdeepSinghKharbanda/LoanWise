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
- **Prepayment modelling** — extra monthly, one-off lump sums, an annual bonus, the biweekly trick, and a one-click **round-up-payment** trick, with interest and years saved
- **Payoff goal solver** — name a date, get the payment that hits it
- **Prepay vs invest** — guaranteed interest saved against a projected market return
- **PMI drop-off**, **ARM payment shock**, a **halfway-paid-off** milestone, and an **interest-crossover** marker, all shown on the balance chart
- **What-if rate slider** — drag to see the payment at any rate, not just the ±1% table rows
- **Payoff timeline bar** and a **Monthly/Bi-weekly/Weekly** payment view toggle
- Tax relief on mortgage interest, with an annual cap (US itemized / India §24)
- Rate sensitivity — payment and lifetime interest at ±1%
- Amortization schedules with **calendar dates**, monthly/yearly views, a **"today's money"** inflation toggle, a **jump-to-month** search, a **"you are here"** row for the real calendar date, CSV and PDF export
- Inputs live in the **URL**, so any calculation is a shareable link; scenarios can be **saved locally** with your own notes, restored, or undone after deleting
- Compare up to four offers with a **shareable comparison link**, CSV export, an inflation toggle, and one-click **import from a saved scenario**
- **Reset to defaults** on every calculator, a **"copy summary"** clipboard action, and native **Web Share** where the browser supports it
- **⌘K command palette** (press `?` for the shortcut list), light/dark (follows the OS live until you choose), six currencies, **works offline** (installable PWA with a real install prompt)
- **Recently viewed** row and a **quick-estimate** widget on the homepage, a **glossary** for terms like APR/PMI/DTI on hover, and a **rate-context** indicator showing whether your rate is typical for that loan type
- **Chart PNG export** and a branded, **printable report** (shown only when you print or save as PDF) that still captures every tab on the tabbed calculator pages

## Run

```
npm install
npm run dev        # dev server
npm test           # 136 tests — math contracts + a render check for every page
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
