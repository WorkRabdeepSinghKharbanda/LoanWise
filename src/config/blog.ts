/**
 * Blog posts at /blog/:slug — narrower, timelier angles than the GUIDES
 * (which are broad reference guides). Same data-driven shape so BlogPage
 * stays a single dynamic component; date is the only field guides don't have.
 */
export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string // ISO yyyy-mm-dd
  intro: string
  sections: { heading: string; body: string }[]
  related: { to: string; label: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-extra-payments-save-more-early',
    title: 'Why an Extra Payment in Year 1 Saves More Than the Same Payment in Year 10',
    description: 'The same extra payment on a loan saves far more interest early in the term than late — here\'s the mechanism, with the numbers.',
    date: '2026-01-15',
    intro:
      'A $2,000 prepayment in month 1 and the same $2,000 prepayment in month 100 do not save the same amount of interest — not close. The difference comes down to how much loan term is still ahead of the payment.',
    sections: [
      {
        heading: 'Interest is charged on what\'s left',
        body: 'Every month\'s interest is the outstanding balance times the monthly rate. A prepayment that removes $2,000 from the balance removes that same $2,000 from every remaining month\'s interest calculation — so the more months remain, the more total interest it wipes out.',
      },
      {
        heading: 'The math, concretely',
        body: 'On a 30-year mortgage, a $2,000 prepayment in month 1 removes roughly 29 years of compounding on that $2,000. The same $2,000 prepaid in year 25, with 5 years left, only removes 5 years of compounding — a fraction of the interest saved.',
      },
      {
        heading: 'What this means practically',
        body: 'If you\'re going to prepay at all, doing it as early as possible — even a smaller amount sooner rather than a larger amount later — usually saves more. Run your own numbers with the amortization schedule to see the exact effect of timing.',
      },
    ],
    related: [
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/emi-calculator-guide', label: 'EMI Calculator Guide' },
    ],
  },
  {
    slug: 'apr-vs-interest-rate',
    title: 'APR vs. Interest Rate: The Number Lenders Advertise Isn\'t the Number That Matters',
    description: 'Two loans quoting the same interest rate can cost very different amounts once fees are included — APR is what actually makes them comparable.',
    date: '2026-02-03',
    intro:
      'A loan\'s advertised interest rate prices the borrowing alone. It says nothing about origination fees, points, or closing costs — which is exactly why two "same rate" offers can cost differently once those are added in.',
    sections: [
      {
        heading: 'What APR folds in',
        body: 'APR spreads a loan\'s fees across its term and expresses the result as a yearly rate, alongside the interest itself. It\'s the standardized way to compare offers that structure their fees differently.',
      },
      {
        heading: 'Why a lower rate can still be the worse deal',
        body: 'A loan with a lower rate but heavier upfront fees can carry a higher APR than a loan with a slightly higher rate and few fees — especially if you won\'t keep the loan long enough to amortize those fees away.',
      },
      {
        heading: 'When fees swamp the rate entirely',
        body: 'On a small loan with large fixed fees, the fees can dominate to the point where the APR calculation itself flags it — a sign to look hard at whether the loan is worth it at all, not just which offer is marginally better.',
      },
    ],
    related: [
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/mortgage-home-loan-guide', label: 'Mortgage & Home Loan Guide' },
    ],
  },
  {
    slug: 'true-cost-of-bnpl',
    title: 'The True Cost of Buy Now, Pay Later — When It\'s Free and When It Isn\'t',
    description: 'BNPL plans are often genuinely interest-free, but late fees and missed installments turn them into one of the most expensive ways to borrow.',
    date: '2026-03-10',
    intro:
      'Buy Now Pay Later can be a genuinely free way to spread a purchase over a few installments — as long as every payment lands on time. The cost only shows up when one doesn\'t.',
    sections: [
      {
        heading: 'The interest-free case',
        body: 'Many BNPL plans charge no interest at all if every installment is paid on schedule — the merchant, not the borrower, is usually covering the cost of offering it.',
      },
      {
        heading: 'Where the risk actually lives',
        body: 'A missed payment usually triggers a flat late fee, and on a short repayment schedule that fee — as a percentage of the amount financed — can equate to a very high effective rate for that single lapse.',
      },
      {
        heading: 'Comparing it to a real loan',
        body: 'The honest comparison folds the *probability* of a late fee into an expected cost, rather than assuming it away — that\'s the only way to see whether BNPL or a small personal loan is actually cheaper for a given purchase.',
      },
    ],
    related: [
      { to: '/bnpl', label: 'BNPL vs Loan Calculator' },
      { to: '/credit-card', label: 'Credit Card Payoff Calculator' },
    ],
  },
  {
    slug: 'how-pmi-drop-off-works',
    title: 'How PMI Drop-Off Actually Works — And How to Make It Happen Sooner',
    description: 'PMI isn\'t forever: here\'s exactly when it\'s required to end, and what shortens the wait.',
    date: '2026-03-20',
    intro:
      'Private Mortgage Insurance protects the lender, not the borrower, and it\'s legally required to end once the loan balance falls low enough relative to the home\'s original value.',
    sections: [
      {
        heading: 'The 78% and 80% thresholds',
        body: 'By law, a lender must automatically cancel PMI once the balance hits 78% of the home\'s original value on schedule. You can typically request cancellation yourself at 80%, which can be sooner if you\'ve prepaid.',
      },
      {
        heading: 'Prepayment moves the date up',
        body: 'Because both thresholds are balance-based, any prepayment that shrinks the balance faster than the standard schedule pulls the PMI drop-off date forward — the amortization schedule shows exactly when that crossover happens.',
      },
      {
        heading: 'Appreciation can help too',
        body: 'If the home\'s value has risen since purchase, some lenders will reassess and drop PMI early based on current value rather than original — usually requiring a new appraisal to prove it.',
      },
    ],
    related: [
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/mortgage-home-loan-guide', label: 'Mortgage & Home Loan Guide' },
    ],
  },
  {
    slug: 'refinance-break-even-explained',
    title: 'The Refinance Break-Even Number Everyone Skips',
    description: 'One number decides whether a refinance is worth it, and it\'s not the new interest rate.',
    date: '2026-03-28',
    intro:
      'Refinance ads sell the new rate. The number that actually matters is the break-even point — how many months until the closing costs are recovered by the lower payment.',
    sections: [
      {
        heading: 'The one calculation that matters',
        body: 'Closing costs ÷ monthly payment savings = break-even months. If you\'ll keep the loan past that point, the refinance saves money; if you\'ll move or refinance again sooner, it doesn\'t.',
      },
      {
        heading: 'Term resets hide inside "lower payment"',
        body: 'A refinance into a fresh 30-year term can lower the payment even without a rate improvement, simply by resetting the clock — that\'s a real payment relief, but it can raise total lifetime interest.',
      },
      {
        heading: 'Rate drops don\'t all pay off the same',
        body: 'A 0.5% drop on a large, long-remaining balance can break even fast; the same drop on a small or nearly-paid-off loan might never recover the closing costs — the balance and remaining term matter as much as the rate delta.',
      },
    ],
    related: [
      { to: '/refinance', label: 'Refinance Calculator' },
      { to: '/guides/refinance-guide', label: 'Refinance Guide' },
    ],
  },
  {
    slug: 'debt-avalanche-vs-snowball-real-numbers',
    title: 'Avalanche vs. Snowball: Running the Actual Numbers on Three Debts',
    description: 'The two debt-payoff strategies compared with concrete balances and rates, not just the theory.',
    date: '2026-04-05',
    intro:
      'Avalanche and snowball get described in theory constantly — the difference is easier to see against real balances, rates, and a fixed extra-payment budget.',
    sections: [
      {
        heading: 'Same debts, two orders',
        body: 'Take three debts of different size and rate. Avalanche attacks the highest rate first regardless of balance; snowball attacks the smallest balance first regardless of rate — same total extra payment, different sequencing.',
      },
      {
        heading: 'Where the interest gap comes from',
        body: 'The interest saved by avalanche comes entirely from clearing high-rate balances sooner — the gap is largest when the smallest-balance debt and the highest-rate debt are different accounts.',
      },
      {
        heading: 'Why snowball still wins for some people',
        body: 'If motivation, not math, is the constraint, snowball\'s early full payoff can sustain the plan long enough to matter more than the extra interest it costs on paper.',
      },
    ],
    related: [
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
      { to: '/guides/debt-payoff-guide', label: 'Debt Payoff Guide' },
    ],
  },
  {
    slug: 'gold-loan-vs-personal-loan',
    title: 'Gold Loan vs. Personal Loan: Same Need, Very Different Pricing',
    description: 'Why a gold loan usually beats a personal loan on rate — and where that comparison breaks down.',
    date: '2026-04-12',
    intro:
      'Both loans can fund the same short-term need, but one is secured by an asset you already own and the other isn\'t — that single difference explains most of the rate gap between them.',
    sections: [
      {
        heading: 'The collateral effect',
        body: 'A gold loan gives the lender something to recover directly if repayment fails; a personal loan gives them nothing but your credit profile. Lenders price that difference straight into the rate.',
      },
      {
        heading: 'Term and structure differ too',
        body: 'Gold loans are often shorter, sometimes bullet-repayment (interest periodically, principal at term end) — compare the full repayment shape, not just the rate, against a personal loan\'s standard EMI.',
      },
      {
        heading: 'What each risks if you can\'t pay',
        body: 'Default on a gold loan risks the pledged gold; default on a personal loan risks your credit standing and future borrowing cost. Neither risk is free — they\'re just different.',
      },
    ],
    related: [
      { to: '/loan/gold', label: 'Gold Loan Calculator' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
      { to: '/guides/gold-loan-guide', label: 'Gold Loan Guide' },
    ],
  },
  {
    slug: 'step-up-emi-for-first-time-earners',
    title: 'Step-Up EMI: A Good Fit for a First Job, a Risky One for a Flat Salary',
    description: 'Step-up EMI matches payments to a rising income curve — here\'s when that curve is realistic and when it isn\'t.',
    date: '2026-04-19',
    intro:
      'A step-up EMI schedule bets on future income growth to justify a lower payment today. That bet pays off for a first-job borrower on a typical career trajectory, and backfires for anyone whose income won\'t rise on schedule.',
    sections: [
      {
        heading: 'The bet the schedule is making',
        body: 'Every step-up schedule assumes income rises roughly in step with the payment increases — the schedule is a forecast, not a guarantee, baked directly into the loan.',
      },
      {
        heading: 'What it costs if the forecast is right',
        body: 'Even when income does rise as expected, a step-up EMI usually costs more in total interest than a flat EMI on the same loan, because the balance stays higher for longer early on.',
      },
      {
        heading: 'What it costs if it\'s wrong',
        body: 'If income growth stalls, the rising EMI can become harder to afford right as it climbs — precisely the opposite of the flexibility the schedule was meant to provide.',
      },
    ],
    related: [
      { to: '/emi/step-up', label: 'Step-Up EMI Calculator' },
      { to: '/guides/step-up-emi-guide', label: 'Step-Up EMI Guide' },
    ],
  },
  {
    slug: 'student-loan-forgiveness-what-counts',
    title: 'Student Loan Forgiveness: What Actually Counts Toward It',
    description: 'Forgiveness timelines sound simple until a payment, a plan switch, or a forbearance period doesn\'t count.',
    date: '2026-04-26',
    intro:
      'Most income-driven repayment plans forgive the remaining balance after a set number of qualifying payments — but "qualifying" is doing a lot of work in that sentence.',
    sections: [
      {
        heading: 'Qualifying payments are specific',
        body: 'Typically only payments made under a qualifying plan, on time, for the full amount due, count toward the forgiveness clock — a period of forbearance or a switch to a non-qualifying plan can pause or reset progress depending on the program\'s rules.',
      },
      {
        heading: 'Balance growth complicates the picture',
        body: 'If payments haven\'t covered accruing interest, the balance being forgiven at the end can be larger than what was originally borrowed — tracking the growing balance separately from payments made shows the plan\'s true shape.',
      },
      {
        heading: 'Why the fine print matters more than the headline number',
        body: 'A "20-year forgiveness" headline says nothing about which payments count, which plans qualify, or how a job or plan change affects the clock — check current program rules rather than assuming the general shape applies exactly.',
      },
    ],
    related: [
      { to: '/student-loan', label: 'Student Loan Calculator' },
      { to: '/guides/student-loan-guide', label: 'Student Loan Guide' },
    ],
  },
  {
    slug: 'rent-vs-buy-hidden-costs',
    title: 'The Rent vs. Buy Costs Nobody Puts in the Headline Comparison',
    description: 'Maintenance, transaction costs, and opportunity cost rarely make it into a quick rent-vs-buy comparison — they should.',
    date: '2026-05-03',
    intro:
      'A quick rent-vs-buy comparison usually stops at "mortgage payment vs. rent." The real comparison has several more line items on both sides.',
    sections: [
      {
        heading: 'Buying\'s hidden costs',
        body: 'Maintenance, property tax, insurance, and transaction costs at both purchase and eventual sale all add real cost that a bare mortgage payment doesn\'t capture — commonly totaling more per year than most buyers expect.',
      },
      {
        heading: 'Renting\'s hidden benefit',
        body: 'The cash not tied up in a down payment and closing costs could be invested elsewhere — that opportunity cost belongs in the comparison too, not just the rent check itself.',
      },
      {
        heading: 'Equity is the counterweight to all of it',
        body: 'Buying\'s costs are offset by equity built through principal payments and appreciation, recovered (net of selling costs) at sale — which is why how long you stay changes the answer more than almost anything else.',
      },
    ],
    related: [
      { to: '/rent-vs-buy', label: 'Rent vs Buy Calculator' },
      { to: '/guides/rent-vs-buy-guide', label: 'Rent vs Buy Guide' },
    ],
  },
  {
    slug: 'interest-only-loans-risk',
    title: 'Interest-Only Loans: The Payment Looks Fine Until the Balance Doesn\'t Move',
    description: 'A lower monthly payment on an interest-only loan hides a balance that never falls during the interest-only period.',
    date: '2026-05-10',
    intro:
      'An interest-only payment can look like an amortizing loan\'s payment at a glance — the difference is that the balance behind it isn\'t moving at all.',
    sections: [
      {
        heading: 'No principal, no exceptions',
        body: 'Every payment during the interest-only period covers interest alone. Compared side-by-side with a fully amortizing loan at the same rate and term, the balance gap between the two only widens with time.',
      },
      {
        heading: 'The bill arrives eventually',
        body: 'Once the interest-only period ends, the loan either recasts to a higher payment over the remaining term, or the full balance comes due as a balloon — both options are noticeably larger than what a same-size amortizing loan would have required from day one.',
      },
      {
        heading: 'Where it can make sense anyway',
        body: 'A short holding period, an income expected to jump before the recast, or a plan to sell the asset before the interest-only window ends are the scenarios where the tradeoff can be worth it — outside those, the deferred principal is just deferred, not avoided.',
      },
    ],
    related: [
      { to: '/balloon', label: 'Interest-Only & Balloon Calculator' },
      { to: '/guides/interest-only-balloon-guide', label: 'Interest-Only & Balloon Guide' },
    ],
  },
  {
    slug: 'emi-holiday-during-job-loss',
    title: 'Taking an EMI Holiday During a Job Loss: What It Actually Buys You',
    description: 'A payment pause can be the right call during a genuine income gap — as long as you know what it costs on the other side.',
    date: '2026-05-17',
    intro:
      'An EMI holiday can be exactly the right tool during a real cash-flow crunch like a job loss — the important part is knowing what it costs before assuming it\'s free breathing room.',
    sections: [
      {
        heading: 'What actually pauses',
        body: 'Only the payment pauses — interest typically keeps accruing on the outstanding balance through the holiday, and that accrued amount is added back once payments resume.',
      },
      {
        heading: 'The loan gets longer, not smaller',
        body: 'A moratorium generally extends the loan\'s total life by roughly the holiday\'s length rather than compressing the remaining schedule to hit the original end date.',
      },
      {
        heading: 'Weighing it against the alternative',
        body: 'During a genuine income gap, the extra interest from a holiday is usually far cheaper than missing payments outright or taking on high-rate emergency debt — the comparison, not the sticker cost alone, is what should drive the decision.',
      },
    ],
    related: [
      { to: '/moratorium', label: 'EMI Holiday Calculator' },
      { to: '/guides/emi-holiday-guide', label: 'EMI Holiday Guide' },
    ],
  },
]
