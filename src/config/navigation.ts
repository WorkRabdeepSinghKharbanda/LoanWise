/** Single source of truth for navigation, the command palette, and the sitemap. */
export interface NavItem {
  to: string
  label: string
  icon: string
  desc: string
  keywords?: string
  /** True for pages whose content is entirely per-visitor localStorage state (nothing for a
   * crawler to see) — excluded from the sitemap and marked noindex so they don't read as thin
   * or duplicate content across crawls. */
  noIndex?: boolean
}

export const LOAN_NAV: NavItem[] = [
  { to: '/loan/personal', label: 'Personal Loan', icon: '💰', desc: 'Unsecured borrowing for anything.' },
  { to: '/loan/car', label: 'Car Loan', icon: '🚗', desc: 'Secured against the vehicle.' },
  { to: '/loan/home', label: 'Home Loan', icon: '🏠', desc: 'Long-term borrowing where rates bite.' },
  { to: '/loan/gold', label: 'Gold Loan', icon: '🪙', desc: 'Short-term borrowing against gold.' },
  { to: '/emi', label: 'EMI', icon: '📊', desc: 'Reducing-balance EMI with prepayment.', keywords: 'india emi equated' },
  { to: '/emi/step-up', label: 'Step-Up EMI', icon: '📈', desc: 'Start lower, rise every year.' },
  { to: '/balloon', label: 'Interest-Only & Balloon', icon: '🎈', desc: 'Defer principal, pay it later.', keywords: 'interest only balloon bullet' },
  { to: '/moratorium', label: 'EMI Holiday', icon: '⏸️', desc: 'The real cost of a payment pause.', keywords: 'moratorium holiday deferment pause' },
]

export const PROPERTY_NAV: NavItem[] = [
  { to: '/mortgage', label: 'Mortgage', icon: '🏦', desc: 'Escrow costs and PMI drop-off.' },
  { to: '/arm', label: 'ARM Stress Test', icon: '📉', desc: 'Payment shock when the rate resets.', keywords: 'adjustable variable arm reset' },
  { to: '/affordability', label: 'Affordability', icon: '🎯', desc: 'How much can I borrow?', keywords: 'dti income budget' },
  { to: '/rent-vs-buy', label: 'Rent vs Buy', icon: '🏘️', desc: 'When buying overtakes renting.' },
  { to: '/refinance', label: 'Refinance', icon: '🔄', desc: 'Break-even on closing costs.', keywords: 'remortgage refi' },
  { to: '/savings-goal', label: 'Savings Goal', icon: '🏦', desc: 'Saving up a down payment.', keywords: 'deposit down payment save' },
]

export const DEBT_NAV: NavItem[] = [
  { to: '/credit-card', label: 'Credit Card Payoff', icon: '💳', desc: 'The minimum-payment trap.', keywords: 'minimum apr card' },
  { to: '/debt-payoff', label: 'Debt Payoff Planner', icon: '🏔️', desc: 'Snowball vs avalanche.', keywords: 'snowball avalanche multiple debts' },
  { to: '/student-loan', label: 'Student Loan', icon: '🎓', desc: 'Income-driven repayment & forgiveness.', keywords: 'idr forgiveness college' },
]

export const CAR_NAV: NavItem[] = [
  { to: '/lease-vs-buy', label: 'Lease vs Buy', icon: '🚙', desc: 'Renting depreciation vs owning it.' },
  { to: '/car-cost', label: 'True Cost of Ownership', icon: '🚗', desc: 'Fuel, insurance, depreciation.', keywords: 'tco depreciation running costs' },
]

export const SHOPPING_NAV: NavItem[] = [
  { to: '/bnpl', label: 'BNPL vs Loan', icon: '🛍️', desc: 'Buy Now Pay Later vs financing it.', keywords: 'buy now pay later klarna affirm afterpay' },
]

export const UTILITY_NAV: NavItem[] = [
  { to: '/compare', label: 'Compare Loans', icon: '⚖️', desc: 'Four scenarios side by side.' },
  { to: '/saved', label: 'Saved Scenarios', icon: '💾', desc: 'Everything you kept.', noIndex: true },
  { to: '/quiz', label: 'Find My Calculator', icon: '🧭', desc: 'Two questions, one answer.', keywords: 'help which quiz' },
  { to: '/glossary', label: 'Glossary', icon: '📖', desc: 'Every term, plain English.', keywords: 'terms definitions apr pmi dti' },
  { to: '/guides', label: 'Guides', icon: '📚', desc: 'In-depth guides on EMI, mortgages, and debt payoff.', keywords: 'guide article learn how to explain' },
]

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Loans', items: LOAN_NAV },
  { title: 'Property', items: PROPERTY_NAV },
  { title: 'Debt', items: DEBT_NAV },
  { title: 'Cars', items: CAR_NAV },
  { title: 'Shopping', items: SHOPPING_NAV },
  { title: 'Tools', items: UTILITY_NAV },
]

export const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)
