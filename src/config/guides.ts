/**
 * Long-form landing pages, separate from the 24 calculators. Each targets a
 * broad search intent (not a single tool) and links out to the calculators
 * that answer it — real, indexable content rather than a thin wrapper, which
 * is what search and AI-answer crawlers actually reward.
 */
export interface Guide {
  slug: string
  title: string
  description: string
  intro: string
  sections: { heading: string; body: string }[]
  faq: { q: string; a: string }[]
  related: { to: string; label: string }[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'emi-calculator-guide',
    title: 'EMI Calculator Guide: How Your Monthly Payment Is Actually Calculated',
    description:
      'How EMI (Equated Monthly Installment) is calculated, why the interest-to-principal split changes every month, and how prepayment shortens a loan.',
    intro:
      'An EMI is a fixed monthly payment that covers a loan\'s interest and principal over a set term. The amount never changes, but what it pays for does — early payments are mostly interest, later ones are mostly principal.',
    sections: [
      {
        heading: 'The formula',
        body: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal, r is the monthly interest rate (annual rate ÷ 12), and n is the number of monthly installments. Every calculator on this site that quotes a "monthly payment" runs this same formula.',
      },
      {
        heading: 'Why the split shifts over time',
        body: 'Interest is charged on the outstanding balance, which is highest at the start of the loan. So early EMIs are interest-heavy; as the balance shrinks, more of each fixed payment goes to principal. This is why paying off a loan early saves more the earlier you do it.',
      },
      {
        heading: 'Step-up EMI and prepayment',
        body: 'A step-up EMI starts lower and rises each year, matching an expected income increase — useful for early-career borrowers. Prepaying (a lump sum or a recurring extra amount) reduces the principal directly, which compounds forward as less interest for every remaining month.',
      },
    ],
    faq: [
      {
        q: 'Does a longer tenure always mean a smaller EMI?',
        a: 'Yes, but a smaller EMI over a longer term usually means more total interest paid, since the balance stays higher for longer.',
      },
      {
        q: 'What is a reducing-balance EMI?',
        a: 'Almost all EMIs today are reducing-balance: interest is charged only on what\'s still owed, not on the original principal — so the interest portion shrinks every month even though the EMI itself stays flat.',
      },
      {
        q: 'Can I change my EMI after the loan starts?',
        a: 'The lender won\'t let you change the scheduled EMI directly, but making a prepayment shortens the remaining term (or lowers future EMIs, depending on what the lender offers) for the same outstanding balance.',
      },
    ],
    related: [
      { to: '/emi', label: 'EMI Calculator' },
      { to: '/emi/step-up', label: 'Step-Up EMI Calculator' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
    ],
  },
  {
    slug: 'mortgage-home-loan-guide',
    title: 'Mortgage & Home Loan Guide: Rates, PMI, and the Real Monthly Cost',
    description:
      'What actually makes up a mortgage payment beyond principal and interest — PMI, escrow, and how points and refinancing change the math.',
    intro:
      'A mortgage quote is rarely just "principal and interest." Property tax, homeowners insurance, and mortgage insurance (PMI) usually ride along in the same monthly bill, and none of them amortize the loan itself.',
    sections: [
      {
        heading: 'What PMI actually is',
        body: 'Private Mortgage Insurance protects the lender, not you, when the down payment is under 20%. It\'s dropped once the loan balance falls under 78-80% of the home\'s original value — tracking that crossover is the single biggest lever on a mortgage\'s true monthly cost.',
      },
      {
        heading: 'Points and the break-even',
        body: 'Buying points trades an upfront fee for a lower rate. Whether that\'s worth it depends entirely on how long the loan is kept — the break-even point is where the upfront cost is recovered by the monthly savings, and it\'s only a win if you stay past it.',
      },
      {
        heading: 'Refinancing math',
        body: 'A refinance resets the clock: closing costs are paid again, in exchange for a (hopefully) lower rate. It only pays off if the monthly savings clear the closing costs before you\'d have sold or refinanced again anyway.',
      },
      {
        heading: 'Rent vs. buy',
        body: 'Buying builds equity but carries maintenance, tax, insurance, and transaction costs renting doesn\'t. The crossover point — when buying\'s net cost (after netting out equity at sale) beats renting — depends heavily on how long you stay.',
      },
    ],
    faq: [
      {
        q: 'When does PMI go away?',
        a: 'By law, a lender must automatically cancel PMI once the balance reaches 78% of the home\'s original value; you can typically request cancellation yourself at 80%.',
      },
      {
        q: 'Is it worth paying points to lower my rate?',
        a: 'Only if you plan to keep the loan past the points\' break-even period — before that point, the upfront fee costs more than the interest it saved.',
      },
      {
        q: 'Should I refinance if rates drop by 1%?',
        a: 'Run the numbers on closing costs against the monthly savings and how long you\'ll keep the loan — a 1% drop is often, but not always, worth it once fees are included.',
      },
    ],
    related: [
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/refinance', label: 'Refinance Calculator' },
      { to: '/rent-vs-buy', label: 'Rent vs Buy Calculator' },
      { to: '/affordability', label: 'Affordability Calculator' },
    ],
  },
  {
    slug: 'debt-payoff-guide',
    title: 'Debt Payoff Guide: Snowball vs. Avalanche, and Escaping the Minimum-Payment Trap',
    description:
      'How the snowball and avalanche debt payoff methods differ, why credit card minimum payments barely dent the balance, and how to pick a strategy for multiple debts.',
    intro:
      'Paying off multiple debts is a sequencing problem: which one do you attack first with any spare cash, while paying the minimum on the rest? Two strategies dominate, and they optimize for different things.',
    sections: [
      {
        heading: 'Avalanche: cheapest, mathematically',
        body: 'Avalanche targets the highest interest rate first, regardless of balance size. It always minimizes total interest paid — the guaranteed-cheapest plan, if you can stay motivated without an early visible win.',
      },
      {
        heading: 'Snowball: fastest visible progress',
        body: 'Snowball targets the smallest balance first, regardless of rate. It clears whole debts faster, which for many people sustains the habit better than avalanche\'s slower, cheaper path — the best plan is the one you actually keep to.',
      },
      {
        heading: 'The credit card minimum-payment trap',
        body: 'A card\'s minimum payment is often set just above the monthly interest charge, so the balance falls barely at all — extending payoff by years and multiplying the total interest paid many times over the original balance.',
      },
      {
        heading: 'Freed-up minimums roll forward',
        body: 'Once a debt is cleared, its minimum payment doesn\'t disappear — it rolls into the extra payment on the next target debt, which is what makes both methods accelerate as they go.',
      },
    ],
    faq: [
      {
        q: 'Snowball or avalanche — which should I use?',
        a: 'Avalanche always costs the least interest mathematically. Snowball clears the smallest balance first for a faster visible win. The cheapest plan is the one you stick with.',
      },
      {
        q: 'Why does my credit card balance barely move?',
        a: 'Minimum payments are usually set just above that month\'s interest charge, so almost none of it reaches the principal — the balance falls very slowly, if at all.',
      },
      {
        q: 'Should I consolidate multiple debts into one loan?',
        a: 'Consolidation can lower the blended rate and simplify payments, but only compare it against your current avalanche/snowball plan on total interest and payoff time before committing.',
      },
    ],
    related: [
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
      { to: '/credit-card', label: 'Credit Card Payoff Calculator' },
      { to: '/student-loan', label: 'Student Loan Calculator' },
    ],
  },
]
