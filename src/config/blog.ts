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
]
