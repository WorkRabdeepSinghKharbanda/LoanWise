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
  {
    slug: 'car-loan-guide',
    title: 'Car Loan Guide: Financing, Leasing, and the True Cost of Owning',
    description:
      'How a car loan compares to leasing, and why depreciation — not the loan interest — is usually the biggest cost of owning a car.',
    intro:
      'A car loan payment is only part of what a car costs. Depreciation, insurance, fuel, and maintenance usually dwarf the interest, and leasing trades ownership for a different set of costs entirely.',
    sections: [
      {
        heading: 'Depreciation is the real cost',
        body: 'A new car typically loses 20-30% of its value in the first year alone. That loss happens whether you financed it, leased it, or paid cash — it just shows up differently on each option\'s bottom line.',
      },
      {
        heading: 'Lease vs. buy',
        body: 'Leasing pays for the car\'s depreciation over the lease term plus a finance charge, then hands it back. Buying pays off the whole car and keeps the (depreciated) asset — and the equity — at the end. Which wins depends on how long you\'d keep the car and how many miles you drive.',
      },
      {
        heading: 'What a loan calculator won\'t show you',
        body: 'A plain loan calculator only prices the financing. Insurance, fuel, maintenance, and depreciation all still apply on top, and together they\'re usually the larger share of what a car actually costs to own.',
      },
    ],
    faq: [
      {
        q: 'Is it cheaper to lease or buy a car?',
        a: 'Buying is usually cheaper over the long run since you keep the asset; leasing can cost less month-to-month and suits people who replace their car every few years.',
      },
      {
        q: 'Why does a car loan\'s interest look small next to the total cost?',
        a: 'Because depreciation, insurance, fuel, and maintenance are usually larger than the interest charged on the loan itself.',
      },
    ],
    related: [
      { to: '/loan/car', label: 'Car Loan Calculator' },
      { to: '/lease-vs-buy', label: 'Lease vs Buy Calculator' },
      { to: '/car-cost', label: 'True Cost of Ownership Calculator' },
    ],
  },
  {
    slug: 'affordability-savings-guide',
    title: 'How Much Can I Borrow? Affordability and Saving for a Down Payment',
    description:
      'How lenders size up how much you can borrow, and how to plan a savings timeline for a down payment.',
    intro:
      'Affordability isn\'t just "what payment can I make" — it\'s what a lender will actually approve, based on income, existing debt, and how much you\'ve saved toward the purchase.',
    sections: [
      {
        heading: 'Debt-to-income ratio',
        body: 'Lenders cap how much of your gross monthly income can go toward debt payments, including the new loan. A lower DTI generally means qualifying for a larger loan, or a better rate on the same one.',
      },
      {
        heading: 'The down payment tradeoff',
        body: 'A larger down payment shrinks the loan itself and can clear mortgage-insurance thresholds, but the saving timeline to reach it is a real cost too — every extra month of saving is a month of rent or missed opportunity elsewhere.',
      },
      {
        heading: 'Working backward from a deadline',
        body: 'A savings goal calculator solves both directions: given a monthly amount, when do you hit the target — or given a deadline, how much do you need to save each month to get there.',
      },
    ],
    faq: [
      {
        q: 'What DTI ratio do lenders look for?',
        a: 'Many lenders look for a total DTI (all debts including the new loan) under roughly 36-43%, though this varies by lender and loan type.',
      },
      {
        q: 'Should I wait to save a bigger down payment or buy sooner?',
        a: 'It depends on how fast prices and rates are moving versus how fast you can save — running both the affordability and savings-goal numbers side by side is the only way to compare them concretely.',
      },
    ],
    related: [
      { to: '/affordability', label: 'Affordability Calculator' },
      { to: '/savings-goal', label: 'Savings Goal Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
    ],
  },
  {
    slug: 'arm-guide',
    title: 'Adjustable-Rate Mortgage (ARM) Guide: What Happens When the Rate Resets',
    description: 'How an ARM\'s introductory rate, caps, and reset schedule work, and how to stress-test the payment shock before it happens.',
    intro:
      'An ARM trades a lower introductory rate for uncertainty later — the rate resets on a schedule, and the payment can rise (or fall) with it, within limits set by the loan\'s caps.',
    sections: [
      {
        heading: 'How the reset works',
        body: 'After the fixed introductory period (commonly 5, 7, or 10 years), the rate adjusts to an index plus a margin, then recasts the remaining balance over the rest of the term at the new rate — the payment can jump noticeably in a single reset.',
      },
      {
        heading: 'Caps limit, but don\'t eliminate, the shock',
        body: 'Periodic and lifetime caps bound how much the rate can move at each reset and over the life of the loan, but even a capped increase can raise the payment substantially if rates have moved a lot since origination.',
      },
      {
        heading: 'Stress-test before you sign',
        body: 'The only way to know if an ARM is affordable is to model the payment at the worst-case allowed rate under the caps — not just the appealing introductory rate — and compare that against your budget headroom.',
      },
    ],
    faq: [
      {
        q: 'Is an ARM ever a good idea?',
        a: 'It can be, if you\'re confident you\'ll sell or refinance before the first reset, or if the introductory savings are large enough to bank against a future increase.',
      },
      {
        q: 'What\'s the difference between a 5/1 and a 7/1 ARM?',
        a: 'The first number is the years the introductory rate holds; the second is how often it adjusts afterward (in years) — a 5/1 resets after year 5 then annually, a 7/1 after year 7.',
      },
    ],
    related: [
      { to: '/arm', label: 'ARM Stress Test Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/refinance', label: 'Refinance Calculator' },
    ],
  },
  {
    slug: 'refinance-guide',
    title: 'Refinance Guide: When Closing Costs Actually Pay for Themselves',
    description: 'How to find a refinance\'s break-even point, and why "rates dropped" isn\'t reason enough on its own.',
    intro:
      'Refinancing resets the loan: a new rate, a new term, and a new round of closing costs. It only wins if the monthly savings clear those costs before you\'d have moved on anyway.',
    sections: [
      {
        heading: 'The break-even point',
        body: 'Divide the closing costs by the monthly payment savings to get the number of months before the refinance pays for itself. Anything after that point is real savings; anything before it is a loss if you sell or refinance again first.',
      },
      {
        heading: 'A lower payment isn\'t always a lower cost',
        body: 'Refinancing into a fresh 30-year term can lower the monthly payment even at the same rate, simply by resetting the amortization clock — but it can raise total lifetime interest if it extends how long you\'re paying.',
      },
      {
        heading: 'Rate-and-term vs. cash-out',
        body: 'A rate-and-term refinance just changes the loan\'s terms; a cash-out refinance also borrows against home equity, increasing the balance — evaluate the added debt on its own merits, not folded into the rate comparison.',
      },
    ],
    faq: [
      {
        q: 'How much do rates need to drop before refinancing is worth it?',
        a: 'There\'s no fixed threshold — it depends entirely on the closing costs versus your monthly savings and how long you\'ll keep the loan. Run the break-even math for your specific numbers.',
      },
      {
        q: 'Does refinancing restart my loan\'s amortization?',
        a: 'Yes — a new loan starts back at mostly-interest payments, which is part of why extending the term can raise total interest even at a lower rate.',
      },
    ],
    related: [
      { to: '/refinance', label: 'Refinance Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/arm', label: 'ARM Stress Test Calculator' },
    ],
  },
  {
    slug: 'rent-vs-buy-guide',
    title: 'Rent vs. Buy Guide: Finding the Real Crossover Point',
    description: 'Why comparing rent to a mortgage payment alone misses most of the real cost of either choice.',
    intro:
      'Rent vs. buy isn\'t "mortgage payment vs. rent check" — buying carries maintenance, property tax, insurance, and transaction costs that renting doesn\'t, while buying also builds equity renting never does.',
    sections: [
      {
        heading: 'What buying adds on top of the mortgage',
        body: 'Property tax, homeowners insurance, maintenance (commonly budgeted around 1% of home value a year), and closing costs at both purchase and sale all add to buying\'s real cost — none of them show up in a bare mortgage-payment comparison.',
      },
      {
        heading: 'Equity is buying\'s counterweight',
        body: 'Every principal payment (and any appreciation) builds equity that\'s recovered at sale, net of selling costs — this is what eventually tips the comparison in buying\'s favor the longer you stay.',
      },
      {
        heading: 'The crossover depends on how long you stay',
        body: 'Because buying\'s upfront costs are fixed but amortize over time, and renting has none of them, the number of years you plan to stay is usually the single biggest lever on which option wins.',
      },
    ],
    faq: [
      {
        q: 'Is buying always better if I stay long enough?',
        a: 'Usually, but not always — it depends on local price-to-rent ratios, rate levels, and how home prices move relative to rent over that period.',
      },
      {
        q: 'What\'s a reasonable maintenance budget for a home?',
        a: 'A common rule of thumb is around 1% of the home\'s value per year, though older homes or ones with more square footage often run higher.',
      },
    ],
    related: [
      { to: '/rent-vs-buy', label: 'Rent vs Buy Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/affordability', label: 'Affordability Calculator' },
    ],
  },
  {
    slug: 'student-loan-guide',
    title: 'Student Loan Guide: Income-Driven Repayment and Forgiveness, Explained',
    description: 'How income-driven repayment plans size your payment, and how negative amortization and forgiveness interact.',
    intro:
      'Income-driven repayment (IDR) plans cap your monthly payment as a share of discretionary income rather than the loan balance — which can mean the balance grows before it shrinks.',
    sections: [
      {
        heading: 'Payment is based on income, not balance',
        body: 'IDR payments are calculated as a percentage of income above a poverty-line threshold, completely independent of how large the loan is — two borrowers with very different balances but the same income can owe the same monthly payment.',
      },
      {
        heading: 'Negative amortization is a real possibility',
        body: 'If the IDR payment is smaller than the interest accruing that month, the unpaid interest can be added to the balance — the loan grows even while payments are being made on time, until income rises enough to cover it.',
      },
      {
        heading: 'Forgiveness closes the loop',
        body: 'Most IDR plans forgive the remaining balance after a set number of qualifying payments (commonly 20-25 years) — tracking the forgiven amount separately from what was actually paid is the only way to see the plan\'s true cost.',
      },
    ],
    faq: [
      {
        q: 'Can my loan balance go up under IDR?',
        a: 'Yes — if the required payment doesn\'t cover that month\'s interest, the shortfall can be added to the balance, a state called negative amortization.',
      },
      {
        q: 'Is forgiven student debt taxable?',
        a: 'Tax treatment of forgiven balances varies by program and has changed by law in recent years — check current rules for your specific plan before assuming either way.',
      },
    ],
    related: [
      { to: '/student-loan', label: 'Student Loan Calculator' },
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
    ],
  },
  {
    slug: 'credit-card-payoff-guide',
    title: 'Credit Card Payoff Guide: Escaping the Minimum-Payment Trap',
    description: 'Why minimum payments barely move the balance, and what it actually takes to pay a card off on purpose.',
    intro:
      'A credit card\'s minimum payment is usually set just above that month\'s interest charge — enough to keep the account current, not enough to make real progress on the balance.',
    sections: [
      {
        heading: 'Why the balance barely moves',
        body: 'With interest compounding daily or monthly at a high APR, a minimum payment set at roughly 1-3% of the balance often barely exceeds the interest accrued — years can pass with the balance falling only slightly.',
      },
      {
        heading: 'What a fixed payment above the minimum does',
        body: 'Committing to a fixed payment well above the minimum — rather than letting it shrink as the balance falls — front-loads the payoff and can cut both the time and total interest dramatically compared to minimum-only payments.',
      },
      {
        heading: 'When the minimum never clears the balance',
        body: 'At a high enough rate relative to the minimum-payment formula, the balance can effectively never reach zero on minimums alone — this is the trap worth checking for before assuming "I\'m paying it off eventually" is true.',
      },
    ],
    faq: [
      {
        q: 'Why does my card balance stay almost the same every month?',
        a: 'The minimum payment is typically set just above the interest charged that month, so very little goes to principal — a small fixed increase above the minimum makes an outsized difference.',
      },
      {
        q: 'Should I pay off my card or invest instead?',
        a: 'Credit card APRs are usually far higher than typical investment returns, so paying down the card first is almost always the better guaranteed return.',
      },
    ],
    related: [
      { to: '/credit-card', label: 'Credit Card Payoff Calculator' },
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
      { to: '/bnpl', label: 'BNPL vs Loan Calculator' },
    ],
  },
  {
    slug: 'interest-only-balloon-guide',
    title: 'Interest-Only and Balloon Loans: The Payment Is Lower Because the Bill Is Later',
    description: 'How interest-only and balloon loans defer principal — and what the payment jump (or lump sum) at the end actually looks like.',
    intro:
      'An interest-only or balloon loan trades a lower payment now for a bigger obligation later — either a lump-sum payoff at term end, or a recast payment that\'s noticeably higher than a vanilla amortizing loan\'s would have been.',
    sections: [
      {
        heading: 'Interest-only period',
        body: 'During the interest-only window, payments cover interest alone — the balance never falls. Every dollar of eventual principal repayment is simply deferred to later in the loan, not eliminated.',
      },
      {
        heading: 'The balloon payment',
        body: 'A balloon loan structures the shortfall as a single lump sum due at term end — refinancing, selling the asset, or having cash on hand to cover it are the only ways to meet that obligation when it arrives.',
      },
      {
        heading: 'Comparing against a vanilla amortizing loan',
        body: 'The honest comparison isn\'t the lower monthly payment alone — it\'s that lower payment against the size of the balloon or the recast payment, on the exact same rate and term, to see the total tradeoff.',
      },
    ],
    faq: [
      {
        q: 'What happens if I can\'t pay the balloon payment?',
        a: 'Most borrowers plan to refinance, sell the asset, or have savings ready — failing to arrange one of these before the due date risks default, so it needs planning well before the term ends.',
      },
      {
        q: 'Why would anyone choose interest-only?',
        a: 'It frees up cash flow now, which can make sense for a short holding period, an investment property, or income that\'s expected to rise well before the balloon comes due.',
      },
    ],
    related: [
      { to: '/balloon', label: 'Interest-Only & Balloon Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
    ],
  },
  {
    slug: 'emi-holiday-guide',
    title: 'EMI Holiday (Moratorium) Guide: The Real Cost of Pausing Payments',
    description: 'What a payment moratorium actually does to a loan\'s total life and cost, once the pause ends.',
    intro:
      'An EMI holiday pauses payments for a set period — useful during a genuine cash crunch — but the loan doesn\'t forget the interest that accrued during the pause.',
    sections: [
      {
        heading: 'Interest keeps accruing during the pause',
        body: 'Even with no payments due, interest typically continues to accrue on the outstanding balance through the moratorium — that accrued interest is added back into the loan once payments resume.',
      },
      {
        heading: 'The loan\'s total life extends',
        body: 'A moratorium extends the loan\'s total life by roughly the holiday\'s length, rather than shrinking the remaining term to fit the original end date — the schedule shifts outward, it doesn\'t compress.',
      },
      {
        heading: 'When it\'s worth it',
        body: 'A moratorium is a genuine tool for a temporary cash-flow gap, not a free pause — modeling the extra interest against the value of the breathing room is the only way to judge whether it\'s worth taking.',
      },
    ],
    faq: [
      {
        q: 'Does a payment holiday hurt my credit score?',
        a: 'A formally arranged moratorium with the lender is typically reported differently than a missed payment, but terms vary — confirm with the lender before assuming it\'s cost-free to your credit.',
      },
      {
        q: 'Does the EMI go up after the holiday?',
        a: 'It depends on the lender\'s terms — some extend the term and keep the EMI flat, others recast the EMI higher over the original remaining term. Check which applies before opting in.',
      },
    ],
    related: [
      { to: '/moratorium', label: 'EMI Holiday Calculator' },
      { to: '/emi', label: 'EMI Calculator' },
    ],
  },
  {
    slug: 'step-up-emi-guide',
    title: 'Step-Up EMI Guide: Starting Lower and Rising With Your Income',
    description: 'How a step-up EMI schedule works, and who it actually suits.',
    intro:
      'A step-up EMI starts below a standard flat EMI and rises on a schedule — typically annually — designed to track an expected rise in income rather than staying flat for the whole term.',
    sections: [
      {
        heading: 'Why start lower at all',
        body: 'Early-career borrowers often have their lowest income relative to future earnings right when they take the loan — a step-up schedule matches the payment to that trajectory instead of sizing the loan around a flat payment the borrower may struggle with early on.',
      },
      {
        heading: 'The tradeoff against a flat EMI',
        body: 'Because early payments are smaller, more interest accrues on a higher balance for longer compared to a flat EMI on the same principal and rate — the total interest paid over the loan\'s life is typically higher.',
      },
      {
        heading: 'Who it suits',
        body: 'It fits borrowers confident their income will rise roughly on schedule — a step that outpaces actual income growth just recreates the affordability problem the plan was meant to solve, later.',
      },
    ],
    faq: [
      {
        q: 'Is step-up EMI more expensive overall?',
        a: 'Usually yes, in total interest, compared to a flat EMI on the same loan — the lower early payments mean the balance stays higher for longer.',
      },
      {
        q: 'Can I switch from step-up back to a flat EMI later?',
        a: 'That depends on the lender\'s terms — some allow restructuring, others don\'t. Confirm before assuming you can switch mid-term.',
      },
    ],
    related: [
      { to: '/emi/step-up', label: 'Step-Up EMI Calculator' },
      { to: '/emi', label: 'EMI Calculator' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
    ],
  },
  {
    slug: 'gold-loan-guide',
    title: 'Gold Loan Guide: Fast, Secured, and Usually Short-Term',
    description: 'How gold loans price against unsecured borrowing, and what to watch for in the term and repayment structure.',
    intro:
      'A gold loan is secured against the gold itself, which typically means faster approval and a lower rate than an unsecured personal loan — in exchange for a shorter term and the collateral at risk.',
    sections: [
      {
        heading: 'Why the rate is usually lower',
        body: 'Because the loan is secured by gold the lender can recover value from directly, gold loans typically carry lower rates than unsecured personal loans of similar size — the collateral shifts risk away from the lender.',
      },
      {
        heading: 'Term length and bullet repayment',
        body: 'Gold loans are often short-term (months rather than years) and sometimes structured as bullet repayment — interest paid periodically, principal due at term end — which changes the cash-flow shape compared to a standard EMI.',
      },
      {
        heading: 'The real risk: the collateral',
        body: 'Defaulting on a gold loan risks losing the pledged gold, not just a credit-score hit — factoring that risk explicitly against the lower rate is the honest way to compare it to an unsecured alternative.',
      },
    ],
    faq: [
      {
        q: 'Is a gold loan cheaper than a personal loan?',
        a: 'Usually, in rate — but compare the full term and repayment structure, not the rate alone, since gold loans are often shorter and can be structured differently (e.g. bullet repayment).',
      },
      {
        q: 'What happens if I can\'t repay a gold loan?',
        a: 'The lender can typically auction the pledged gold to recover the outstanding amount — this is the collateral risk that offsets the loan\'s lower rate.',
      },
    ],
    related: [
      { to: '/loan/gold', label: 'Gold Loan Calculator' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
    ],
  },
  {
    slug: 'personal-loan-guide',
    title: 'Personal Loan Guide: Unsecured Borrowing, Priced for the Risk',
    description: 'Why personal loans carry higher rates than secured borrowing, and how to size one against what it\'s actually for.',
    intro:
      'A personal loan is unsecured — no collateral backs it — which is exactly why it carries a higher rate than a car, home, or gold loan of comparable size: the lender is pricing in more risk, not less flexibility.',
    sections: [
      {
        heading: 'Why unsecured costs more',
        body: 'With no asset to recover in default, the lender prices the rate around the borrower\'s creditworthiness alone — a stronger credit profile narrows the gap to secured rates, but rarely closes it.',
      },
      {
        heading: 'What it\'s actually good for',
        body: 'Personal loans suit needs with no natural collateral — debt consolidation, a one-off expense, bridging a gap — where a secured loan either isn\'t available or isn\'t the right structure.',
      },
      {
        heading: 'Sizing the loan to the need',
        body: 'Because the rate is already higher, borrowing more than the actual need "just in case" compounds the cost — running the EMI and total-interest numbers on the exact amount needed, not a rounded-up figure, keeps the real cost down.',
      },
    ],
    faq: [
      {
        q: 'Why is my personal loan rate so much higher than my friend\'s car loan?',
        a: 'A car loan is secured by the vehicle; a personal loan isn\'t secured by anything, so the lender prices in more risk — the gap reflects that, not just your credit profile.',
      },
      {
        q: 'Does prepaying a personal loan early always save money?',
        a: 'Yes, in interest — but check for prepayment penalties first, since some personal loans charge a fee for paying off ahead of schedule.',
      },
    ],
    related: [
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
    ],
  },
  {
    slug: 'bnpl-guide',
    title: 'Buy Now, Pay Later Guide: Free Credit, Until It Isn\'t',
    description: 'How BNPL plans avoid charging interest, and where the real cost hides once a payment slips.',
    intro:
      'Buy Now, Pay Later can be genuinely interest-free — the merchant, not the shopper, usually covers the cost of offering it. The catch only shows up when a payment is missed.',
    sections: [
      {
        heading: 'Why it can be free at all',
        body: 'BNPL providers typically earn their margin from merchant fees, not shopper interest — as long as every installment lands on schedule, the plan can cost exactly nothing extra.',
      },
      {
        heading: 'Where the cost hides',
        body: 'Miss a payment and a flat late fee usually applies — on a short repayment schedule, that fee expressed as an annualized rate can be far higher than even a high-APR credit card.',
      },
      {
        heading: 'Comparing it honestly to a loan',
        body: 'The fair comparison folds in the *probability* of a late fee as an expected cost, rather than assuming every payment lands on time — that\'s the only way to see whether BNPL or a small personal loan is actually cheaper for a given purchase.',
      },
    ],
    faq: [
      {
        q: 'Does BNPL affect my credit score?',
        a: 'It depends on the provider — some report to credit bureaus and some don\'t, and policies have been changing across the industry, so check the specific plan\'s terms.',
      },
      {
        q: 'Is BNPL better than a credit card for a big purchase?',
        a: 'If every installment will be paid on time, BNPL is often cheaper since it\'s frequently interest-free — but the moment a payment risks slipping, the math can flip sharply.',
      },
    ],
    related: [
      { to: '/bnpl', label: 'BNPL vs Loan Calculator' },
      { to: '/credit-card', label: 'Credit Card Payoff Calculator' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
    ],
  },
  {
    slug: 'loan-comparison-guide',
    title: 'How to Compare Loan Offers Side by Side (Without Getting Fooled by the Headline Rate)',
    description: 'What actually differs between two loan offers beyond the interest rate — and how to line them up fairly.',
    intro:
      'Two loan offers with the same headline rate can cost very differently once term, fees, and prepayment terms are accounted for. Comparing them fairly means lining up all of it, not just the rate.',
    sections: [
      {
        heading: 'Rate alone isn\'t the comparison',
        body: 'APR (rate plus fees, annualized) is the fairer number than the bare interest rate — two offers with the same rate but different fees can have meaningfully different APRs.',
      },
      {
        heading: 'Term changes the total cost, not just the payment',
        body: 'A longer term lowers the monthly payment but usually raises total interest paid — comparing two offers only on monthly payment, without checking the term behind it, misses this entirely.',
      },
      {
        heading: 'Prepayment terms matter more than they look',
        body: 'A loan that penalizes early payoff can cost more in practice than a slightly higher-rate loan with no such penalty, if there\'s any real chance of paying it off ahead of schedule.',
      },
    ],
    faq: [
      {
        q: 'What\'s the single most useful number to compare across offers?',
        a: 'APR, since it folds fees into an annualized rate — but pair it with total interest paid over the actual term you\'d keep the loan, not just the rate.',
      },
      {
        q: 'How many loan scenarios should I compare at once?',
        a: 'Two to four is usually enough to see the real tradeoffs clearly — more than that tends to obscure the comparison rather than sharpen it.',
      },
    ],
    related: [
      { to: '/compare', label: 'Compare Loans' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/refinance', label: 'Refinance Calculator' },
    ],
  },
  {
    slug: 'amortization-schedule-guide',
    title: 'How to Read an Amortization Schedule (And What It\'s Actually Telling You)',
    description: 'Every row of an amortization schedule breaks a payment into interest and principal — here\'s what to look for.',
    intro:
      'An amortization schedule lists every payment over a loan\'s life, split into how much covers interest and how much reduces the balance. Reading it well tells you far more than the monthly payment alone.',
    sections: [
      {
        heading: 'The split shifts every month',
        body: 'Because interest is charged on the outstanding balance, early rows are interest-heavy and later rows are principal-heavy — the fixed payment doesn\'t change, but what it buys does.',
      },
      {
        heading: 'What to look for around a prepayment',
        body: 'A schedule that reflects a prepayment shows the balance dropping faster than the base schedule and the remaining term shortening — comparing the two schedules side by side is the clearest way to see a prepayment\'s actual effect.',
      },
      {
        heading: 'The payoff date is the schedule\'s real headline',
        body: 'Two loans with the same monthly payment can have very different total costs if their schedules run different lengths — the schedule\'s final row (and the interest total above it) is the number that matters most.',
      },
    ],
    faq: [
      {
        q: 'Why is so little of my early payment going to principal?',
        a: 'Interest is charged on the full outstanding balance, which is highest at the start — as the balance falls, a growing share of each fixed payment goes to principal instead.',
      },
      {
        q: 'Can I see the effect of a single extra payment on my schedule?',
        a: 'Yes — model it directly: adding a prepayment field recomputes the whole schedule with that extra amount applied, so you can see the new payoff date and interest total immediately.',
      },
    ],
    related: [
      { to: '/emi', label: 'EMI Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/emi-calculator-guide', label: 'EMI Calculator Guide' },
    ],
  },
  {
    slug: 'fixed-vs-variable-rate-guide',
    title: 'Fixed vs. Variable Rate: What You\'re Actually Trading Away',
    description: 'A fixed rate trades a potentially lower average cost for certainty — here\'s how to decide which one you need more.',
    intro:
      'A fixed rate locks in the same payment for the whole term. A variable (or adjustable) rate can start lower but moves with the market — the choice is really about how much certainty is worth to you.',
    sections: [
      {
        heading: 'What "fixed" actually guarantees',
        body: 'A fixed rate guarantees the payment amount, not the cheapest possible cost — over the life of the loan, a variable rate can turn out cheaper or more expensive depending on where rates move.',
      },
      {
        heading: 'Why variable rates start lower',
        body: 'Lenders typically price in a discount for taking on the initial period of a variable-rate loan, since the borrower is accepting the rate-reset risk the lender would otherwise have to price in as certainty.',
      },
      {
        heading: 'How to decide',
        body: 'Stress-testing a variable-rate loan at its worst-case allowed rate, and comparing that scenario against a fixed rate\'s certain payment, is the concrete way to see whether the initial savings are worth the risk for your situation.',
      },
    ],
    faq: [
      {
        q: 'Is a variable rate ever the safer choice?',
        a: 'It can be if you\'re confident you\'ll pay off or refinance before a reset, or if your budget has enough headroom to absorb a worst-case increase comfortably.',
      },
      {
        q: 'Do variable rates always end up more expensive?',
        a: 'Not always — it depends entirely on how rates move over the loan\'s life, which isn\'t knowable in advance. That uncertainty is the whole tradeoff.',
      },
    ],
    related: [
      { to: '/arm', label: 'ARM Stress Test Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/arm-guide', label: 'ARM Guide' },
    ],
  },
  {
    slug: 'debt-consolidation-guide',
    title: 'Debt Consolidation Guide: When Combining Debts Actually Helps',
    description: 'Consolidating several debts into one loan can lower the blended rate and simplify payments — but only if the new terms are actually better.',
    intro:
      'Debt consolidation replaces several balances with a single new loan. It can genuinely lower cost and complexity, or it can just repackage the same debt at a longer term — the difference is in the details.',
    sections: [
      {
        heading: 'What consolidation actually changes',
        body: 'A consolidation loan pays off existing balances and replaces them with one new balance, ideally at a lower blended rate than the average of what it replaced — it doesn\'t reduce the debt itself, only its structure.',
      },
      {
        heading: 'The term-extension trap',
        body: 'A consolidation loan with a lower payment but a much longer term can end up costing more in total interest than the original debts would have, even at a nominally lower rate — always check the total cost, not just the new payment.',
      },
      {
        heading: 'Comparing against snowball or avalanche first',
        body: 'Before consolidating, running the numbers on an avalanche or snowball payoff plan against the current debts as-is gives a baseline to judge whether the consolidation offer is actually an improvement.',
      },
    ],
    faq: [
      {
        q: 'Does debt consolidation hurt my credit score?',
        a: 'There\'s often a small, temporary dip from the new credit inquiry and account, but consolidation can help longer-term if it lowers your credit utilization and keeps payments on time.',
      },
      {
        q: 'Is consolidation the same as a balance transfer?',
        a: 'They\'re related but not identical — a balance transfer moves credit card debt to a new card (often with a promotional rate), while consolidation typically uses a personal loan to pay off multiple debts of any type.',
      },
    ],
    related: [
      { to: '/debt-payoff', label: 'Debt Payoff Planner' },
      { to: '/credit-card', label: 'Credit Card Payoff Calculator' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
    ],
  },
  {
    slug: 'prepayment-guide',
    title: 'Should You Pay Off Your Loan Early? The Prepayment Math',
    description: 'Lump sums, extra monthly payments, and the biweekly trick all shorten a loan — here\'s how each one compares.',
    intro:
      'Prepaying a loan always reduces the principal faster than scheduled, which saves interest — the question is which prepayment method fits your cash flow, and whether the loan even allows it without a penalty.',
    sections: [
      {
        heading: 'Extra monthly vs. lump sum vs. biweekly',
        body: 'A steady extra amount each month compounds savings the earliest; a lump sum (like a bonus) makes one large dent whenever it arrives; the biweekly trick effectively sneaks in one extra full payment a year by splitting payments in half every two weeks instead of monthly.',
      },
      {
        heading: 'Check for a prepayment penalty first',
        body: 'Some loans charge a fee for paying off early, specifically to recover interest the lender expected to earn — that fee needs to be weighed against the prepayment\'s interest savings before committing.',
      },
      {
        heading: 'Prepay vs. invest',
        body: 'If the loan\'s rate is lower than a realistic expected investment return, investing the spare cash instead can come out ahead mathematically — though prepaying carries zero risk, which has its own value.',
      },
    ],
    faq: [
      {
        q: 'Does the biweekly payment trick actually work?',
        a: 'Yes — paying half the monthly payment every two weeks results in 26 half-payments a year, equivalent to 13 full monthly payments instead of 12, which shortens the loan without feeling like a big extra expense.',
      },
      {
        q: 'Should I prepay my mortgage or invest the extra money?',
        a: 'Compare the mortgage\'s rate against a realistic expected return on the investment — if the investment return is meaningfully higher, investing can come out ahead, though prepaying is the risk-free option.',
      },
    ],
    related: [
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/emi', label: 'EMI Calculator' },
      { to: '/guides/emi-calculator-guide', label: 'EMI Calculator Guide' },
    ],
  },
  {
    slug: 'credit-score-and-loan-rate-guide',
    title: 'How Your Credit Score Actually Moves Your Loan Rate',
    description: 'The same loan, same lender, can carry a very different rate depending on the credit score behind the application.',
    intro:
      'Lenders price a loan\'s rate around the risk of default — and credit score is one of the biggest single inputs into that risk estimate, often moving the rate by a percentage point or more between score bands.',
    sections: [
      {
        heading: 'Why score bands matter more than the exact number',
        body: 'Lenders often price in bands (e.g. "good," "very good," "excellent") rather than a smooth curve — crossing a band threshold can move the offered rate meaningfully even for a small score change.',
      },
      {
        heading: 'What moves the needle fastest',
        body: 'Payment history and credit utilization typically carry the most weight — paying down revolving balances and keeping payments on time tend to move a score faster than other factors.',
      },
      {
        heading: 'Why it\'s worth checking before applying',
        body: 'A rate difference of even half a percentage point compounds meaningfully over a loan\'s full term — checking your score and shopping multiple lenders before applying is usually worth more than negotiating after the fact.',
      },
    ],
    faq: [
      {
        q: 'How much can my rate improve by raising my credit score?',
        a: 'It varies by lender and loan type, but moving up a full score band can often shift the rate by a percentage point or more — run both rates through the calculator to see the real payment difference.',
      },
      {
        q: 'Does shopping around for a loan hurt my credit score?',
        a: 'Multiple loan inquiries within a short window (often 14-45 days depending on the scoring model) are typically counted as a single inquiry for rate-shopping purposes — check the specific model\'s rules.',
      },
    ],
    related: [
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/credit-card', label: 'Credit Card Payoff Calculator' },
    ],
  },
  {
    slug: 'loan-tenure-guide',
    title: 'Short Term vs. Long Term: Choosing a Loan\'s Tenure',
    description: 'A longer tenure lowers the payment but raises total interest — the right length depends on what you\'re optimizing for.',
    intro:
      'Tenure — how long a loan runs — is one of the few variables a borrower controls directly. Stretching it lowers the monthly payment; shortening it lowers the total cost. Rarely both.',
    sections: [
      {
        heading: 'The direct tradeoff',
        body: 'For the same principal and rate, a longer tenure spreads payments thinner but keeps the balance outstanding — and accruing interest — for longer, which is why total interest paid rises with tenure even though the rate hasn\'t changed.',
      },
      {
        heading: 'When a shorter tenure isn\'t actually affordable',
        body: 'A shorter tenure\'s higher payment only helps if it\'s sustainably affordable — a payment that strains the budget defeats the purpose of saving interest by risking missed payments or no financial cushion.',
      },
      {
        heading: 'A middle path: shorten it later',
        body: 'Choosing a longer tenure for payment safety, then prepaying opportunistically when cash flow allows, captures some of both benefits — flexibility now, interest savings when affordable.',
      },
    ],
    faq: [
      {
        q: 'Is a shorter loan tenure always the better financial choice?',
        a: 'It\'s cheaper in total interest, but only if the higher payment is comfortably affordable — an unaffordable short tenure creates more risk than it saves in interest.',
      },
      {
        q: 'Can I shorten my loan\'s tenure after taking it?',
        a: 'Prepaying reduces the balance faster than scheduled, which can shorten the effective payoff date even on a loan taken with a longer original tenure — check whether your lender applies extra payments to shorten the term or lower future payments.',
      },
    ],
    related: [
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/prepayment-guide', label: 'Prepayment Guide' },
    ],
  },
  {
    slug: 'co-borrower-affordability-guide',
    title: 'Applying With a Co-Borrower: How It Changes What You Can Afford',
    description: 'Combining incomes on an application can raise how much a lender will approve — but it combines the debt obligation too.',
    intro:
      'Adding a co-borrower combines both incomes for affordability purposes, which can raise the approved loan size — but it also means both parties are on the hook for the full debt, not half each.',
    sections: [
      {
        heading: 'Combined income, combined DTI',
        body: 'A co-borrower\'s income is added to the applicant\'s for affordability purposes, but so is their existing debt — the combined debt-to-income ratio, not just the combined income, is what actually determines the approved amount.',
      },
      {
        heading: 'Joint liability is the real commitment',
        body: 'Both co-borrowers are typically fully liable for the entire loan, not half each — if one stops paying, the other is on the hook for the full remaining balance, not a proportional share.',
      },
      {
        heading: 'Running the numbers both ways',
        body: 'Comparing an affordability estimate with and without the co-borrower\'s income and debt shows exactly how much the combined application changes the approved amount — worth checking before assuming it helps as much as expected.',
      },
    ],
    faq: [
      {
        q: 'Does a co-borrower need to have good credit too?',
        a: 'Most lenders consider both applicants\' credit profiles, and a weaker co-borrower score can sometimes offset the benefit of their added income — check how the specific lender weighs both.',
      },
      {
        q: 'Is a co-borrower the same as a co-signer?',
        a: 'No — a co-borrower typically has ownership rights to whatever the loan finances and is fully liable for the debt; a co-signer is usually liable for the debt without any ownership stake.',
      },
    ],
    related: [
      { to: '/affordability', label: 'Affordability Calculator' },
      { to: '/mortgage', label: 'Mortgage Calculator' },
      { to: '/guides/affordability-savings-guide', label: 'Affordability & Savings Guide' },
    ],
  },
  {
    slug: 'first-time-borrower-guide',
    title: 'First Loan Ever? A Beginner\'s Guide to Reading the Terms',
    description: 'APR, term, principal, amortization — a plain-English walkthrough of the terms that show up on every loan offer.',
    intro:
      'Every loan offer uses the same handful of terms, whether it\'s a car loan, a mortgage, or a personal loan. Understanding them once means never being confused by an offer again.',
    sections: [
      {
        heading: 'The core four: principal, rate, term, payment',
        body: 'Principal is what\'s borrowed; the rate is the annual cost of borrowing it; the term is how long you have to repay; the payment is what falls out of combining all three through the amortization formula.',
      },
      {
        heading: 'APR vs. interest rate',
        body: 'The interest rate prices the borrowing alone; APR folds in fees too, annualized — always compare APRs between offers, not bare rates, since fee structures differ between lenders.',
      },
      {
        heading: 'What to actually check before signing',
        body: 'The monthly payment, the total interest over the full term, whether there\'s a prepayment penalty, and — for anything with a variable rate — what the worst-case payment looks like after a reset.',
      },
    ],
    faq: [
      {
        q: 'What\'s the single most important number on a loan offer?',
        a: 'APR, since it\'s the only figure that folds fees and rate into one comparable number — but always check the total interest over the full term as well.',
      },
      {
        q: 'Where can I look up terms I don\'t recognize?',
        a: 'A glossary of loan terms — APR, amortization, PMI, DTI and the rest — in plain English is the fastest way to decode an unfamiliar offer.',
      },
    ],
    related: [
      { to: '/glossary', label: 'Glossary' },
      { to: '/loan/personal', label: 'Personal Loan Calculator' },
      { to: '/quiz', label: 'Find My Calculator' },
    ],
  },
]
