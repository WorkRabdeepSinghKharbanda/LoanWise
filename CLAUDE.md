# CLAUDE.md — Agent Guide

## Read first, in order

1. [README.md](./README.md) — what this app is, run/build/deploy commands
2. This file — architecture, control flow, conventions
3. [.claude/brain/feature/000-index.md](./.claude/brain/feature/000-index.md) — one file per calculator/tool (route, category, one-line description); generated from `src/config/navigation.ts`, the actual source of truth — regenerate the brain from there if they disagree, never hand-edit the two out of sync
4. [src/types/loan.ts](./src/types/loan.ts) — every data shape in the app
5. [src/utils/loanMath.ts](./src/utils/loanMath.ts) — core amortization engine
6. [src/utils/advancedMath.ts](./src/utils/advancedMath.ts) — the specialist calculators
7. [src/config/navigation.ts](./src/config/navigation.ts) — the calculator registry; nav, footer, command palette and sitemap all derive from it
8. The test files next to the math ([loanMath.test.ts](./src/utils/loanMath.test.ts), [advancedMath.test.ts](./src/utils/advancedMath.test.ts), [regressions.test.ts](./src/utils/regressions.test.ts)) — they are the contract any math change must keep green

Never edit a calculator before reading #4–#6. Every page is a thin wrapper around those two math modules.

## Stack

React 19 + TypeScript, Vite 8, Tailwind v4 (`@tailwindcss/vite`; no `tailwind.config.js` — theme, the `dark` variant, chart color roles and print rules all live in [src/index.css](./src/index.css)), react-router-dom v7, vitest + @testing-library/react + happy-dom. No backend, no charting library, no state library.

## Architecture — control flow

```
main.tsx
  └─ App.tsx
       └─ ErrorBoundary            (render crash → recoverable screen, not a white page)
            └─ SettingsProvider    (currency + locale + light/dark, localStorage-backed)
                 └─ BrowserRouter
                      └─ Layout    (glass header, mega-menus, ⌘K palette, mobile sheet, footer, ad slots)
                           └─ <Outlet/>  one page per route

page (owns its input state)
  │   URL-backed  → useLoanCalculator()   : GenericLoanPage, EmiPage
  │   local state → useState              : every other calculator
  ▼
loanMath.ts            pure core: payment, schedule, step-up, affordability,
                       rent-vs-buy, debt payoff, refinance, prepay-vs-invest,
                       rate sensitivity, year summary, formatters, date labels
advancedMath.ts        pure specialists: APR with fees, points buydown, ARM
                       reset, tax relief, credit-card trap, student-loan IDR,
                       lease-vs-buy, balloon/interest-only, savings goal,
                       car TCO, moratorium/EMI-holiday, BNPL vs loan,
                       inflation adjustment, prepayment penalty
  ▼
presentational components (no arithmetic beyond formatting)
  inputs      NumberField · LoanForm · MortgageExtraFields
  results     CalculatorResult  ← reused by the plain loan pages
                ├─ ResultSummary        payment / interest / total / payoff date
                ├─ Actions              copy shareable link · save scenario
                ├─ charts/SplitBar      principal vs interest
                ├─ charts/BalanceChart  balance over time + optional marker
                └─ AmortizationTable    monthly/yearly, calendar dates,
                                        "today's money" toggle, CSV + PDF
  bolt-ons    PrepaymentPanel · AprPanel · PointsBuydownPanel ·
              TaxReliefPanel · RateSensitivity · RateContext ·
              Term (glossary tooltip) · AdSlot
  charts      TwoSeriesChart (with table view) · PayoffChart ·
              RentVsBuyChart · CostBreakdownBar · ChartDownloadButton (PNG,
              works on every chart — all are inline SVG, none are divs)
  print       PrintReport (generic stats header) · LoanPrintReport (LoanResult
              wrapper) · PrintButton (standalone print trigger for pages with
              no AmortizationTable of their own)
  chrome      CommandPalette (⌘K) · ShortcutsSheet (?) · RecentlyViewed
```

**Data flow is one-directional and re-derived every render** (memoized, never mirrored into state): input → pure function → result object → presentational component. The only shared state is `SettingsContext` (currency, locale, theme). Everything else is page-local.

**Two state homes, deliberately:**
- `useLoanCalculator` keeps a plain `LoanInput` **in the URL query string** (`?amount=&rate=&term=&extra=&lump=&lumpAt=&bonus=`) — that is what makes those views shareable. Use it whenever the inputs are just a `LoanInput`.
- Pages with a wider input shape use local `useState`. To make one of those shareable, extend the hook — do not fork it.

**Mortgage is the page that reshapes its input.** It feeds `principal − downPayment` into `calculateLoan()`, and passes that same bare `loanShape` to the APR / points / sensitivity panels. Two different "extras" must never be conflated:
- `extraMonthlyPayment` — principal **prepayment**, shortens the loan.
- `extraMonthly` (a `ResultSummary` / `CalculatorResult` prop) — flat escrow costs (tax, insurance, PMI) added to the *displayed* payment and never amortized.

## Feature index

Each of these is a self-contained slice — math in one of the two math modules, UI in one or more components, wired into whichever pages need it. Skim this before touching any of them.

| Feature | Math | UI | Notes |
|---|---|---|---|
| Core amortization | `loanMath.ts` | `LoanForm`, `ResultSummary`, `AmortizationTable` | The engine everything else sits on |
| Prepayment (extra/lump/annual bonus) | `loanMath.ts` (`buildAmortizationSchedule`) | `PrepaymentPanel` | Biweekly trick + payoff-goal solver + prepay-vs-invest all live here |
| Rate sensitivity | `loanMath.ts` (`rateSensitivity`) | `RateSensitivity` | ±1% table |
| APR with fees | `advancedMath.ts` (`calculateApr`) | `AprPanel` | Flags `feesExceedPrincipal` rather than lying about the rate |
| Points buydown | `advancedMath.ts` (`pointsBuydown`) | `PointsBuydownPanel` | Best option depends on how long you keep the loan |
| Tax relief | `advancedMath.ts` (`calculateTaxRelief`) | `TaxReliefPanel` | Annual deduction cap supported |
| ARM / payment shock | `advancedMath.ts` (`calculateArm`) | `ArmPage` | Rate reset is capped, then recast over the rest of the term |
| Moratorium / EMI holiday | `advancedMath.ts` (`calculateMoratorium`) | `MoratoriumPage` | Extends the loan's total life by the holiday length — does **not** shrink the remaining term (see comment in the function) |
| Credit card trap | `advancedMath.ts` (`calculateCreditCardPayoff`) | `CreditCardPage` | `interestSaved`/`monthsSaved` are `null`, not negative, when the minimum never clears |
| Student loan IDR | `advancedMath.ts` (`calculateStudentLoan`) | `StudentLoanPage` | Tracks negative amortization and forgiveness separately |
| Debt payoff (snowball/avalanche) | `loanMath.ts` (`calculateDebtPayoff`) | `DebtPayoffPage`, `PayoffChart` | Freed-up minimums roll into the next target debt |
| Refinance | `loanMath.ts` (`calculateRefinance`) | `RefinancePage` | Flags a longer term that lowers payment but raises lifetime interest |
| Affordability | `loanMath.ts` (`calculateAffordability`) | `AffordabilityPage` | Co-borrower income is page-local (combined into `monthlyIncome` before the calc; not a math-module concept) |
| Rent vs buy | `loanMath.ts` (`calculateRentVsBuy`) | `RentVsBuyPage`, `RentVsBuyChart` | Buy cost nets out equity at sale |
| Savings goal | `advancedMath.ts` (`calculateSavingsGoal`) | `SavingsGoalPage` | Solves both "when do I hit it" and "what do I need for a deadline" |
| Lease vs buy | `advancedMath.ts` (`calculateLeaseVsBuy`) | `LeaseVsBuyPage` | Buy side nets out residual equity |
| Car total cost of ownership | `advancedMath.ts` (`calculateCarCost`) | `CarCostPage`, `CostBreakdownBar` | Depreciation is usually the largest line, not the loan interest |
| Interest-only / balloon | `advancedMath.ts` (`calculateBalloonLoan`) | `BalloonPage` | Compares against a vanilla fully-amortizing loan on the same terms |
| BNPL vs loan | `advancedMath.ts` (`calculateBnplVsLoan`) | `BnplPage` | Folds late-fee *risk* (probability × fee) into an expected cost |
| Compare scenarios | `loanMath.ts` (`calculateLoan`, reused) | `ComparePage` | Up to 4, localStorage-persisted, cards or table view |
| Saved scenarios | `src/utils/savedScenarios.ts` | `SavedPage`, `CalculatorResult`'s save button | Stores route + query string, so restoring is just a navigation |
| Quiz / "find my calculator" | — (routing logic only) | `QuizPage` | Branching 2-question decision tree |
| Glossary | `src/components/Term.tsx` (`GLOSSARY` dict) | `Term` (hover tooltip), `GlossaryPage` | `Term` used inline in prose; `/glossary` lists every entry |
| Rate context | — (static bands) | `RateContext`, `LOAN_TYPES[*].typicalRateRange` | One quiet line under the rate field — not a chart |
| i18n (partial) | `src/i18n/translations.ts` | `useT()` in `SettingsContext` | See **i18n** below — chrome only, not page prose |
| Chart PNG export | `src/utils/exportChart.ts` | `ChartDownloadButton` | Every chart is inline SVG (SplitBar/CostBreakdownBar were rewritten from divs specifically so this works everywhere) |
| Printable report | — | `PrintReport`, `LoanPrintReport`, `PrintButton` | Print-only (`hidden print:flex`); every calculator page has either an `AmortizationTable` (own print/PDF button) or an explicit `PrintButton` |
| Landing guides | `src/config/guides.ts` | `GuidesIndexPage`, `GuidePage` | Long-form SEO content, distinct from the 24 calculators — one dynamic `/guides/:slug` page renders any entry; each ships Article + FAQPage JSON-LD and links back to its related calculators |
| Blog | `src/config/blog.ts` | `BlogIndexPage`, `BlogPage` | Shorter, dated posts at `/blog/:slug` — same one-dynamic-page pattern as guides, `BlogPosting` JSON-LD instead of Article+FAQ |
| Command palette | — | `CommandPalette` (⌘K) | Built from `ALL_NAV`; also toggles theme |
| Shortcuts sheet | — | `ShortcutsSheet` (`?` key) | Lists the palette shortcut |
| Recently viewed | `src/utils/recentlyViewed.ts` | `RecentlyViewed` (Home only) | Recorded on every route change in `Layout` |
| Ad slots | `src/config/ads.ts` | `AdSlot` | Off by default; reserves height so enabling causes no layout shift |
| PWA | `public/manifest.webmanifest`, `public/sw.js` | — | Installable, works offline |
| SEO | `vite.config.ts` (`sitemap()` plugin) | `Seo` component, `index.html` JSON-LD | Sitemap generated from `ALL_NAV` at build time — can't go stale |

## i18n

`src/i18n/translations.ts` holds a flat dictionary (`STRINGS`) for `en` / `hi` / `es`, keyed by `StringKey`. `useT()` (in `SettingsContext.tsx`) returns a `(key) => string` bound to the current locale, falling back to English for anything missing. The language switcher lives in `Layout`'s header next to the currency selector; `locale` persists to `localStorage` the same way `currency` does (`readLocale`, whitelisted against `LOCALES` — never trust the raw stored string).

**What's translated:** nav chrome (`brand`, `search`, `menu`, footer tagline), the Home hero, and the shared calculator UI (`LoanForm` labels, `ResultSummary` stat labels, `AmortizationTable`'s show/hide button).

**What's NOT translated (by design, deferred):** every page's explanatory prose, panel copy (`PrepaymentPanel`, `AprPanel`, etc.), the glossary, and per-page `<Seo>` descriptions. Translating those is a much larger pass — touching all ~24 pages — and was deliberately scoped out rather than done partially. If picking it up: add keys to `STRINGS` per locale (TypeScript enforces every locale has every key, via `StringKey = keyof typeof STRINGS.en`), thread `useT()` through the page, and keep it separate from `Intl.NumberFormat`'s locale (already wired through `CURRENCIES`, unrelated to UI language).

## Routes

Registered in `App.tsx`; presented from `src/config/navigation.ts`. 24 calculators + `/glossary`.

| Group | Paths |
|---|---|
| Loans | `/loan/{personal,car,home,gold}`, `/emi`, `/emi/step-up`, `/balloon`, `/moratorium` |
| Property | `/mortgage`, `/arm`, `/affordability`, `/rent-vs-buy`, `/refinance`, `/savings-goal` |
| Debt | `/credit-card`, `/debt-payoff`, `/student-loan` |
| Cars | `/lease-vs-buy`, `/car-cost` |
| Shopping | `/bnpl` |
| Tools | `/compare`, `/saved`, `/quiz`, `/glossary`, `/guides`, `/guides/:slug`, `/blog`, `/blog/:slug` |
| — | `/` landing, `*` → redirect home |

## Conventions

- **Adding a loan type** (education loan, say): add an entry to `LOAN_TYPES` in [src/config/loanTypes.ts](./src/config/loanTypes.ts), including a `typicalRateRange` — the route is generated in `App.tsx`. Then add it to `LOAN_NAV` in `navigation.ts` so nav, footer, palette and sitemap pick it up. Never hand-write a page for this case.
- **Adding a whole calculator**: pure function + tests in `advancedMath.ts` **first**, then the page, then a route in `App.tsx`, then an entry in `navigation.ts`, then a row in `PAGES` in [src/App.test.tsx](./src/App.test.tsx). If the page has no `AmortizationTable`, add a `<PrintReport>` + `<PrintButton>` so it still has an export path — see the **Feature index** row for print.
- **Adding a landing guide**: it's just a new entry in the `GUIDES` array in [src/config/guides.ts](./src/config/guides.ts) — `GuidePage` renders it at `/guides/:slug` for free, and it's picked up by the sitemap, `llms.txt`, and the guide-page smoke test in `App.test.tsx` automatically. Never hand-write a page for this case.
- **Adding a blog post**: same pattern — a new entry in `BLOG_POSTS` in [src/config/blog.ts](./src/config/blog.ts), rendered at `/blog/:slug` by `BlogPage`. Guides are broad reference content; blog posts are shorter, dated, narrower-angle pieces — pick the array that matches which one you're writing.
- **Money on screen** always goes through `useFormat().money()` (or `.compact()` for axis ticks) so the currency selector works. Never hardcode a currency in a component; never inline `toFixed` for money.
- **UI text** that's part of shared chrome goes through `useT()` (see **i18n**); page-specific prose stays plain English for now — don't half-translate a single page, it's inconsistent with the rest.
- **Numeric inputs** use [NumberField](./src/components/NumberField.tsx), never a raw `<input type="number">` — the number type adds spinners, rejects partially typed values, and turns an empty field into 0. NumberField holds raw keystrokes locally, validates against min/max, and only reports valid numbers upward. Pass `slider` for a drag control.
- **Dark mode** is class-based (`.dark` on `<html>`, toggled by `SettingsContext`). Every surface, border and text color needs an explicit `dark:` counterpart — nothing inverts automatically.
- **Charts are always inline SVG, never `<div>` bars** — this is what makes `ChartDownloadButton`'s PNG export work uniformly (SplitBar and CostBreakdownBar were specifically rewritten from divs to SVG rects for this reason). Colors come from `--series-1` / `--series-2` on `.viz` in `index.css` — the validated categorical slots (blue/orange, stepped per mode, passing CVD and contrast gates on both surfaces). New chart: put it in `src/components/charts/`, wrap the root in `.viz`, use the role variables rather than raw hex, add a `ChartDownloadButton` wired to a `useRef<SVGSVGElement>`, keep a legend for ≥2 series, offer a table view for accessibility, and never add a second y-axis.
- **Glossary terms**: wrap a term in `<Term>word</Term>` (must be a key in `GLOSSARY`, exported from `Term.tsx`) to get a hover tooltip; adding a new entry to `GLOSSARY` makes it show up on `/glossary` automatically.
- **Ads (Google AdSense)** are off. [src/config/ads.ts](./src/config/ads.ts) holds the `enabled` flag, reserved slot heights, and each slot's real AdSense `adSlotId`; [src/config/adsense.ts](./src/config/adsense.ts) holds the publisher id (`ADSENSE_PUBLISHER_ID`, a placeholder until replaced), `isAdsConfigured()`, and `loadAdsenseScript()`. `<AdSlot name="…"/>` renders nothing while `ADS.enabled` is false, reserving space either way so switching ads on causes no layout shift; once enabled + configured + the visitor has accepted [CookieConsentBanner](./src/components/CookieConsentBanner.tsx) (tracked via [src/utils/consent.ts](./src/utils/consent.ts)), it renders a real `<ins class="adsbygoogle">` unit and pushes it — otherwise the placeholder box. The AdSense script itself is never loaded before consent (GDPR). To go live: replace `ADSENSE_PUBLISHER_ID`, fill in each slot's `adSlotId`, replace the placeholder ids in [public/ads.txt](./public/ads.txt) and the `google-adsense-account` meta tag in `index.html`, then set `ADS.enabled = true`. [Privacy policy](./src/pages/PrivacyPage.tsx) (`/privacy`, linked from the footer) covers what's stored and how ads use cookies.
- **No global state beyond SettingsContext** (currency, locale, theme). Pages own their inputs.
- **No backend.** All math is synchronous and local; never add a network call for something the math modules can do. This is also why accounts/cloud sync are explicitly out of scope — they'd break the "nothing leaves your browser" promise made on the homepage and in the footer.
- Anything that shouldn't print gets `className="no-print"`; a schedule table's expanded body carries `print-open` so it expands across pages; `PrintReport`/`LoanPrintReport` carry `hidden print:flex` so they only exist in print output.

## Platform bits

- **PWA**: [public/manifest.webmanifest](./public/manifest.webmanifest) + [public/sw.js](./public/sw.js) (network-first for navigations, cache-first for hashed assets). Bump `CACHE` in `sw.js` when the shell changes shape.
- **SEO**: `robots.txt` in `public/` explicitly allows the major AI-assistant crawlers (GPTBot, ClaudeBot, anthropic-ai, Google-Extended, PerplexityBot, CCBot) alongside `*`; `sitemap.xml` **and** `llms.txt` ([llmstxt.org](https://llmstxt.org)) are both generated at build time by the `sitemap()`/`llmsTxt()` functions in [vite.config.ts](./vite.config.ts) from `ALL_NAV` + `GUIDES`, so neither can go stale — a `NavItem` marked `noIndex: true` (e.g. `/saved`, whose content is entirely per-visitor localStorage) is excluded from both. Per-page `<title>`/`<meta>`/canonical/OG/Twitter tags and a per-page `BreadcrumbList` JSON-LD come from the [Seo](./src/components/Seo.tsx) component (React 19 hoists title/meta/link natively — no helmet library); it renders `noindex, follow` when passed `noIndex`, and renders nothing at all on `/` since `index.html`'s static tags already cover the homepage identically — Seo duplicating them there would leave two of everything in `<head>`. Site-wide JSON-LD (`Organization`, `WebApplication`, `FAQPage`) and light/dark `theme-color` tags live in `index.html`; each guide page adds its own `Article` + `FAQPage` JSON-LD on top.
- **Command palette**: ⌘K / Ctrl-K, built from `ALL_NAV`. **Shortcuts sheet**: press `?` (ignored while typing in a field).

## Verifying changes

```
npm test         # 125 tests: math contracts + a render smoke test for every page
npm run build    # tsc -b && vite build — must pass with zero errors
npm run dev      # click the affected route(s), both themes, a non-USD currency, and (if chrome-related) a non-English locale
```

The render smoke tests in `src/App.test.tsx` mount every page for real, so a crash-on-mount fails locally and in CI rather than shipping a blank screen. Test files are excluded from the app typecheck (`tsconfig.app.json`); vitest owns them. CI runs both commands on every PR ([.github/workflows/ci.yml](./.github/workflows/ci.yml)).

## Deploy

`vercel --prod` from the repo root. [vercel.json](./vercel.json) carries the SPA rewrite, immutable caching for hashed assets, a no-cache rule for `sw.js`, and basic security headers. Production alias: https://loan-calculator-ashen-six.vercel.app
