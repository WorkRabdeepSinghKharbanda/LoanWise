/**
 * Topic hubs at /topics/:slug — group every guide, blog post, and alternative
 * page by theme so related content links to a shared hub instead of only to
 * each other individually. Deepens the internal link graph and gives crawlers
 * a clear topical hierarchy, which flat index pages alone don't provide.
 */
export interface Topic {
  slug: string
  label: string
  intro: string
  /** The guide slug (src/config/guides.ts) that fully answers this topic in one place — featured
   * first on the hub page as "start here", distinct from the hub's plain link list. */
  pillarSlug?: string
}

export const TOPICS: Topic[] = [
  {
    slug: 'mortgage',
    label: 'Mortgages & Home Loans',
    intro:
      'Everything about buying with a mortgage: rates, PMI, points, ARMs, refinancing, and how much house you can actually afford.',
    pillarSlug: 'mortgage-complete-guide',
  },
  {
    slug: 'emi',
    label: 'EMI & Amortization',
    intro:
      'How a reducing-balance EMI is actually calculated, why the interest/principal split shifts over time, and how prepayment changes it.',
    pillarSlug: 'emi-complete-guide',
  },
  {
    slug: 'debt',
    label: 'Debt Payoff & Credit Cards',
    intro:
      'Snowball vs. avalanche, escaping the credit card minimum-payment trap, and when debt consolidation actually helps.',
  },
  {
    slug: 'car-loans',
    label: 'Car Loans & Leasing',
    intro: 'Financing vs. leasing a car, and the true all-in cost of owning one beyond the loan payment.',
  },
  {
    slug: 'student-loan',
    label: 'Student Loans',
    intro: 'Income-driven repayment, negative amortization, and what actually counts toward forgiveness.',
  },
  {
    slug: 'bnpl',
    label: 'Buy Now, Pay Later',
    intro: 'When a BNPL plan is genuinely free, and when late fees and multiple plans make it more expensive than it looks.',
  },
  {
    slug: 'loan-basics',
    label: 'Loan Basics & Comparing Offers',
    intro:
      'Reading a loan offer, fixed vs. variable rates, APR vs. interest rate, and how to compare offers side by side without getting fooled by the headline rate.',
  },
  {
    slug: 'alternatives',
    label: 'Alternatives to Other Calculators',
    intro: 'How this site compares to Bankrate, NerdWallet, and Calculator.net for loan and mortgage math.',
  },
]
