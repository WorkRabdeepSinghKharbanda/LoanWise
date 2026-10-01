/**
 * "Alternative to X" comparison pages at /alternatives/:slug — real search demand
 * confirmed via Google Autocomplete (see .claude/brain/seo/keywords.json, the
 * "alternatives" category: "bankrate alternative", "nerdwallet alternatives",
 * "calculator net alternative"). Same one-dynamic-page pattern as guides/blog.
 *
 * Tone: factual and nominative, not disparaging — a comparison table of
 * publicly observable traits (account requirement, cost, offline use), not
 * claims about the competitor's internals we can't verify. Every "where X is
 * still the better choice" entry is included deliberately — an honest gap
 * builds more trust than a one-sided pitch, and is itself a crawlable signal
 * of genuine, non-thin content.
 */
export interface Alternative {
  slug: string
  competitor: string
  title: string
  description: string
  intro: string
  /** Why people search for this comparison — grounds the page before the table. */
  whoSearchesThis: string
  comparison: { trait: string; competitor: string; us: string }[]
  whenTheyWin: string
  howToSwitch: string[]
  faq: { q: string; a: string }[]
  related: { to: string; label: string }[]
}

export const ALTERNATIVES: Alternative[] = [
  {
    slug: 'bankrate-alternative',
    competitor: 'Bankrate',
    title: 'Bankrate Alternative: A Free, No-Account Loan & Mortgage Calculator Suite',
    description:
      'Bankrate pairs its calculators with rate-shopping and lead forms. Here\'s a factual comparison for anyone who just wants the math without the account.',
    intro:
      'Bankrate is widely used for mortgage and loan calculators, often reached while comparing advertised rates. It also bundles calculators with lender-matching tools and sign-up prompts aimed at generating rate quotes — which is a different goal than quickly running your own numbers.',
    whoSearchesThis:
      'People already using Bankrate\'s calculators who want a comparison before committing time to sign-up flows, or anyone searching "bankrate alternative" or "is bankrate reliable" while deciding where to run their numbers.',
    comparison: [
      { trait: 'Account required to see full results', competitor: 'Calculators are generally usable without one; its broader rate-shopping products are built around lender-matching, which commonly asks for contact details', us: 'Never — no account, no sign-up, anywhere on the site' },
      { trait: 'Lender rate quotes / lead generation', competitor: 'Yes — core to the product; expect contact prompts', us: 'None — this site has no lender relationships and sells no leads' },
      { trait: 'Data leaves the browser', competitor: 'Contact and loan details submitted for rate quotes', us: 'Never — every calculation runs client-side; nothing is sent anywhere' },
      { trait: 'Full amortization schedule export', competitor: 'Varies by calculator', us: 'CSV and PDF on every amortizing calculator' },
      { trait: 'Number of distinct calculators', competitor: 'Broad financial coverage beyond loans (banking, investing, insurance)', us: '24 calculators, all loan/mortgage/debt-focused' },
      { trait: 'Cost', competitor: 'Free to use', us: 'Free to use' },
    ],
    whenTheyWin:
      'Bankrate is the stronger choice if the actual goal is comparing live advertised lender rates, not just running your own hypothetical numbers — that is squarely its purpose, and this site makes no attempt to replicate rate-shopping or lender matching.',
    howToSwitch: [
      'Pick the calculator matching your need from the categories above (mortgage, EMI, personal loan, etc.)',
      'Enter the same principal, rate and term you were testing — no account or email needed to see the full result',
      'Use the amortization table\'s CSV/PDF export to keep a copy, the same way you might have saved a Bankrate result',
    ],
    faq: [
      {
        q: 'Does this site offer live mortgage rates the way Bankrate does?',
        a: 'No — this site calculates based on a rate you enter; it doesn\'t source or display live lender rate data. For that, Bankrate\'s rate-shopping tools are the better fit.',
      },
      {
        q: 'Is Bankrate free to use?',
        a: 'Yes, Bankrate\'s calculators are free — the difference here is in sign-up prompts and lead-generation for rate quotes, not pricing.',
      },
      {
        q: 'Can I export a full amortization schedule here the way I might screenshot a Bankrate result?',
        a: 'Yes — every amortizing calculator (mortgage, EMI, personal/car/home/gold loan) includes a month-by-month table with CSV and PDF export.',
      },
      {
        q: 'Does switching mean losing the ability to compare lender offers?',
        a: 'Yes, for live rate-shopping specifically — this site is built for running your own numbers against rates you already have, not sourcing new ones.',
      },
    ],
    related: [
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/compare', label: 'Compare Loans' },
      { to: '/guides/mortgage-home-loan-guide', label: 'Mortgage & Home Loan Guide' },
    ],
  },
  {
    slug: 'nerdwallet-alternative',
    competitor: 'NerdWallet',
    title: 'NerdWallet Alternative: Loan Calculators Without an Account or Lead Forms',
    description:
      'NerdWallet\'s calculators sit inside a broader personal-finance platform with product recommendations. Here\'s a factual comparison for a calculator-only need.',
    intro:
      'NerdWallet is a personal-finance platform covering credit cards, banking, insurance and loans, with calculators embedded alongside product recommendations and affiliate-linked offers. For someone who wants only the calculator — not the surrounding recommendation engine — the comparison is worth making explicit.',
    whoSearchesThis:
      'People who found a NerdWallet calculator through a search result and want to know if there\'s a comparable tool without the broader platform around it — reflected in real searches like "nerdwallet alternatives" and "is nerdwallet free".',
    comparison: [
      { trait: 'Account required', competitor: 'Calculators are generally usable without one; the platform\'s recommendation features are typically account-based', us: 'Never required anywhere' },
      { trait: 'Product recommendations / affiliate links', competitor: 'Core to the platform — calculators sit alongside card and loan recommendations', us: 'None — no product recommendations, no affiliate relationships' },
      { trait: 'Scope', competitor: 'Broad personal finance (credit, banking, insurance, investing, loans)', us: 'Loans, mortgages and debt specifically — 24 calculators' },
      { trait: 'Data leaves the browser', competitor: 'Account/profile data if you sign in for personalized recommendations', us: 'Never — fully client-side' },
      { trait: 'Saved scenarios', competitor: 'Requires an account', us: 'Saved locally in your browser, no account' },
      { trait: 'Cost', competitor: 'Free to use', us: 'Free to use' },
    ],
    whenTheyWin:
      'NerdWallet is the better fit if the goal extends beyond a single calculation — comparing credit cards, reading reviews, or getting product recommendations across financial categories. That breadth is its core value and isn\'t something a calculator-only site attempts to replace.',
    howToSwitch: [
      'Find the matching calculator in the nav (loans, mortgage, debt, cars) for what you were calculating on NerdWallet',
      'Run the same numbers — no sign-in needed to see the complete result, including the full schedule',
      'If you need the broader product comparisons NerdWallet offers, that\'s outside this site\'s scope — the two can be used alongside each other',
    ],
    faq: [
      {
        q: 'Are NerdWallet\'s calculators actually free?',
        a: 'Yes — NerdWallet\'s calculators themselves are free. The company\'s revenue comes from the affiliate/advertising relationships around the product recommendations, not from calculator access.',
      },
      {
        q: 'Can I save a scenario for later without an account?',
        a: 'Yes — scenarios save to your browser\'s local storage automatically; nothing requires creating an account or signing in.',
      },
      {
        q: 'Does this site recommend specific loan products or lenders?',
        a: 'No — there are no product recommendations, lender partnerships, or affiliate links anywhere on this site. It\'s calculators only.',
      },
    ],
    related: [
      { to: '/compare', label: 'Compare Loans' },
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
      { to: '/guides/first-time-borrower-guide', label: 'First Loan Ever? Beginner\'s Guide' },
    ],
  },
  {
    slug: 'calculator-net-alternative',
    competitor: 'Calculator.net',
    title: 'Calculator.net Alternative: Modern Loan Calculators With Amortization Export',
    description:
      'Calculator.net covers an enormous range of calculators beyond finance. For loan and mortgage math specifically, here\'s a focused, factual comparison.',
    intro:
      'Calculator.net is a general-purpose calculator site spanning finance, math, health, and more — its loan and mortgage calculators are a small slice of a very large catalog. For someone who only needs loan math, a dedicated site built around that one domain is a different kind of tool.',
    whoSearchesThis:
      'People who landed on a Calculator.net loan or mortgage tool via search and want to know what a loan-focused alternative looks like — matching real searches for "calculator net alternative" and "free loan calculator".',
    comparison: [
      { trait: 'Scope', competitor: 'Hundreds of calculators across finance, math, fitness, and more', us: '24 calculators, all loans/mortgage/debt' },
      { trait: 'Amortization schedule export', competitor: 'Varies by calculator', us: 'CSV and PDF on every amortizing calculator, with a "today\'s money" inflation-adjusted toggle' },
      { trait: 'Prepayment / lump-sum modelling', competitor: 'Available on some loan calculators', us: 'Extra monthly, lump-sum, and annual-bonus prepayment on every loan type, plus a biweekly-payment and payoff-goal solver' },
      { trait: 'Scenario comparison', competitor: 'One calculation at a time, typically', us: 'Up to 4 scenarios side by side, saved locally' },
      { trait: 'Dark mode / mobile design', competitor: 'Utilitarian, dense layout', us: 'Light/dark theme, responsive layout, keyboard shortcuts (⌘K palette)' },
      { trait: 'Cost', competitor: 'Free to use', us: 'Free to use' },
    ],
    whenTheyWin:
      'Calculator.net is the better fit for a one-off calculation outside finance entirely — unit conversions, health metrics, general math — where its breadth across unrelated domains is exactly the point. For loan math alone, the comparison above is where the difference actually shows up.',
    howToSwitch: [
      'Match your Calculator.net loan tool to the equivalent calculator here (mortgage, EMI, personal/car/home/gold loan, refinance, etc.)',
      'Re-enter principal, rate and term — results compute instantly, same as before',
      'If prepayment, biweekly payments, or scenario comparison weren\'t available on the tool you were using, those are available here without switching calculators again',
    ],
    faq: [
      {
        q: 'Is Calculator.net worse for loan math specifically?',
        a: 'Not necessarily worse — the core amortization math is standard and any correct calculator will agree. The difference is in surrounding features: export formats, prepayment modelling, scenario comparison, and a loan-specific UI rather than a general calculator chrome.',
      },
      {
        q: 'Does Calculator.net have mortgage and EMI calculators?',
        a: 'Yes, among its very large catalog — this comparison is specifically for someone who only needs that slice and might prefer a dedicated tool for it.',
      },
      {
        q: 'Can I compare multiple loan scenarios side by side?',
        a: 'Yes — up to 4 scenarios at once, saved in your browser, viewable as cards or a table.',
      },
    ],
    related: [
      { to: '/compare', label: 'Compare Loans' },
      { to: '/emi', label: 'EMI Calculator' },
      { to: '/guides/emi-calculator-guide', label: 'EMI Calculator Guide' },
    ],
  },
]
