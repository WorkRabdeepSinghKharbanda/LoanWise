# Keyword index

Raw Google Autocomplete data (demand signals, not volumes — no paid keyword tool
is connected) lives in `keywords.json`, fetched from
`https://suggestqueries.google.com/complete/search`. This file maps that data to
what it actually drove: which page targets which intent, and which gaps it
surfaced that got filled with new content.

Regenerate `keywords.json` periodically (quarterly is reasonable) as search
behavior shifts — the fetch script used is throwaway shell + `curl`, not
checked in; rebuild it from the category/seed list below if needed.

## Seed categories fetched

`emi`, `personal_loan`, `mortgage`, `home_loan`, `debt_payoff`, `bnpl`,
`refinance`, `car_loan`, `student_loan`, `arm`, `affordability`, `rent_vs_buy`,
`alternatives` — each with 4-7 seed queries (e.g. `mortgage` → "mortgage
calculator", "mortgage vs rent", "mortgage prepayment calculator", "mortgage
points calculator").

## What the data confirmed

- **"X alternative" / "free loan calculator" / "best emi calculator without
  ads"** — real search volume for calculator-site comparisons. Confirmed
  competitors by name: Bankrate, NerdWallet, Calculator.net. → built
  `/alternatives` hub + 3 comparison pages (`src/config/alternatives.ts`).
- **"mortgage points calculator break-even"** — no existing guide covered
  points/break-even math directly (`refinance-break-even-explained` is a
  different break-even). → new guide `mortgage-points-break-even-guide`.
- **"how much house can i afford" / "dti calculator"** — `/affordability` is a
  calculator but had no explanatory guide. → new guide
  `how-much-house-can-you-afford-guide`.
- **"arm vs fixed rate" / "rate reset calculator"** — `/arm` is a calculator
  with no guide walking through the reset mechanism. → new guide
  `arm-payment-shock-guide`.
- **"lease vs buy calculator" / "true cost of car ownership"** — two related
  calculators (`/lease-vs-buy`, `/car-cost`) with no guide tying them together.
  → new guide `lease-vs-buy-car-guide`.
- **Regional variants** ("mortgage calculator usa/india/uk/canada/dubai") —
  confirms the existing currency-selector approach (one calculator, switchable
  currency) is the right shape; no separate regional pages were warranted.
- **Named-personality queries** ("debt payoff calculator ramsey/ramit") are
  financial-personality searches, not competitor products — no comparison page
  built for these; `debt-avalanche-vs-snowball-real-numbers` already covers the
  underlying method neutrally.

## Page → primary keyword → intent map

| Page | Primary keyword | Intent |
|---|---|---|
| `/guides/mortgage-points-break-even-guide` | mortgage points calculator break-even | Decision/comparison |
| `/guides/how-much-house-can-you-afford-guide` | how much house can i afford, dti calculator | Planning |
| `/guides/arm-payment-shock-guide` | arm mortgage calculator, rate reset | Risk assessment |
| `/guides/lease-vs-buy-car-guide` | lease vs buy calculator, true cost of ownership | Decision/comparison |
| `/alternatives/bankrate-alternative` | bankrate alternative, is bankrate reliable | Switching intent |
| `/alternatives/nerdwallet-alternative` | nerdwallet alternatives | Switching intent |
| `/alternatives/calculator-net-alternative` | calculator net alternative | Switching intent |

## Standing practice

Per `CLAUDE.md`'s guide/blog conventions: new keyword-driven guides go in
`src/config/guides.ts` (comprehensive, FAQ-driven — matches the structure this
research calls for), narrower dated takes go in `src/config/blog.ts`. Re-run
the autocomplete fetch and extend both arrays periodically — this is a
compounding-over-months lever, not a one-time pass.
