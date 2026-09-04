export interface LoanInput {
  principal: number
  annualRatePercent: number
  termMonths: number
  /** Optional extra amount paid toward principal every month. */
  extraMonthlyPayment?: number
  /** Optional one-off payment applied to principal at a given month. */
  lumpSumAmount?: number
  lumpSumMonth?: number
  /** Optional extra paid once every 12 months (a bonus, a 13th payment). */
  annualExtraPayment?: number
}

export interface AmortizationRow {
  month: number
  payment: number
  principalPaid: number
  interestPaid: number
  balance: number
}

export interface LoanResult {
  /** Scheduled payment, excluding any extra monthly payment. */
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  schedule: AmortizationRow[]
  /** Months actually needed to clear the loan (< termMonths when paying extra). */
  payoffMonths: number
  /** Interest avoided vs. paying no extra. 0 when no extra payment. */
  interestSaved: number
  /** Months clipped off the term vs. paying no extra. 0 when no extra payment. */
  monthsSaved: number
}

export interface LoanTypeConfig {
  id: string
  label: string
  icon: string
  blurb: string
  defaultPrincipal: number
  defaultRatePercent: number
  defaultTermMonths: number
  /** Rough typical rate band shown next to the rate field, for context only. */
  typicalRateRange: [number, number]
}

export interface MortgageInput extends LoanInput {
  downPayment: number
  monthlyPropertyTax: number
  monthlyInsurance: number
  monthlyPmi: number
}

export interface StepUpInput extends LoanInput {
  /** Percent the payment rises by every 12 months. */
  annualStepUpPercent: number
}

export interface AffordabilityInput {
  monthlyIncome: number
  existingMonthlyDebt: number
  dtiPercent: number
  annualRatePercent: number
  termMonths: number
  downPayment: number
}

export interface AffordabilityResult {
  maxMonthlyPayment: number
  maxLoanAmount: number
  maxHomePrice: number
}

export interface RentVsBuyInput {
  homePrice: number
  downPayment: number
  annualRatePercent: number
  termMonths: number
  monthlyRent: number
  annualRentGrowthPercent: number
  annualAppreciationPercent: number
  annualTaxInsurancePercent: number
  yearsToStay: number
}

export interface RentVsBuyYear {
  year: number
  rentCost: number
  buyCost: number
}

export interface RentVsBuyResult {
  years: RentVsBuyYear[]
  breakEvenYear: number | null
  rentTotal: number
  buyTotal: number
}

export interface RateSensitivityRow {
  ratePercent: number
  delta: number
  monthlyPayment: number
  totalInterest: number
  monthlyDelta: number
}

export interface YearSummary {
  year: number
  payment: number
  principalPaid: number
  interestPaid: number
  endingBalance: number
}

export interface Debt {
  id: string
  name: string
  balance: number
  annualRatePercent: number
  minimumPayment: number
}

export type PayoffStrategy = 'snowball' | 'avalanche'

export interface DebtPayoffResult {
  strategy: PayoffStrategy
  months: number
  totalInterest: number
  totalPaid: number
  /** Debt names in the order they get cleared, with the month each is cleared. */
  order: { name: string; clearedMonth: number; interestPaid: number }[]
  /** Total balance remaining at the end of each month, for charting. */
  balanceByMonth: number[]
}

export interface RefinanceInput {
  currentBalance: number
  currentRatePercent: number
  currentRemainingMonths: number
  newRatePercent: number
  newTermMonths: number
  closingCosts: number
}

export interface RefinanceResult {
  currentMonthlyPayment: number
  newMonthlyPayment: number
  monthlySaving: number
  breakEvenMonths: number | null
  currentTotalInterest: number
  newTotalInterest: number
  lifetimeSaving: number
}

export interface PrepayVsInvestResult {
  interestSaved: number
  investmentValue: number
  investedContributions: number
  better: 'prepay' | 'invest'
  difference: number
}

export interface FeeInput {
  /** Flat origination / processing fee. */
  originationFee: number
  /** Discount points, each 1% of the loan, paid to cut the rate. */
  points: number
  /** Other closing costs financed or paid up front. */
  otherFees: number
}

export interface AprResult {
  nominalRatePercent: number
  aprPercent: number
  /** Everything paid on top of principal and interest. */
  totalFees: number
  monthlyPayment: number
  /**
   * Fees swallow the whole advance, so there is no meaningful APR —
   * `aprPercent` falls back to the nominal rate and must not be shown.
   */
  feesExceedPrincipal: boolean
}

export interface PointsOption {
  points: number
  ratePercent: number
  cost: number
  monthlyPayment: number
  monthlySaving: number
  breakEvenMonths: number | null
  totalInterest: number
  netSavingOverTerm: number
}

export interface ArmInput {
  principal: number
  initialRatePercent: number
  fixedMonths: number
  resetRatePercent: number
  termMonths: number
  /** Cap on how much the rate can move at the first reset. */
  periodicCapPercent: number
}

export interface ArmResult {
  schedule: AmortizationRow[]
  initialPayment: number
  resetPayment: number
  paymentShock: number
  paymentShockPercent: number
  cappedResetRate: number
  totalInterest: number
}

export interface TaxReliefResult {
  grossInterest: number
  deductibleInterest: number
  taxSaved: number
  netInterest: number
  effectiveRatePercent: number
}

export interface CreditCardInput {
  balance: number
  aprPercent: number
  /** Minimum as a percent of the balance... */
  minimumPercent: number
  /** ...but never below this floor. */
  minimumFloor: number
  /** Optional fixed payment to compare against paying the minimum. */
  fixedPayment: number
}

export interface CreditCardPlan {
  months: number
  totalInterest: number
  totalPaid: number
  balanceByMonth: number[]
  neverPaysOff: boolean
}

export interface CreditCardResult {
  minimumOnly: CreditCardPlan
  fixed: CreditCardPlan
  /** null when either plan never clears — the two aren't comparable then. */
  monthsSaved: number | null
  interestSaved: number | null
}

export interface StudentLoanInput {
  balance: number
  annualRatePercent: number
  standardTermMonths: number
  annualIncome: number
  /** Income floor that is protected from the repayment calculation. */
  povertyLine: number
  /** Percent of discretionary income paid each year. */
  discretionaryPercent: number
  annualIncomeGrowthPercent: number
  /** Months of payments before the remaining balance is written off. */
  forgivenessMonths: number
}

export interface StudentLoanResult {
  standard: { monthlyPayment: number; months: number; totalInterest: number; totalPaid: number }
  incomeDriven: {
    startingPayment: number
    months: number
    totalInterest: number
    totalPaid: number
    forgivenAmount: number
    balanceByMonth: number[]
    negativelyAmortizing: boolean
  }
}

export interface LeaseVsBuyInput {
  vehiclePrice: number
  months: number
  /** Lease side. */
  leaseMonthlyPayment: number
  leaseDownPayment: number
  leaseEndFees: number
  /** Buy side. */
  buyDownPayment: number
  buyRatePercent: number
  buyTermMonths: number
  /** Share of the price the car is still worth at the end. */
  residualValuePercent: number
}

export interface LeaseVsBuyResult {
  leaseTotalCost: number
  buyCashSpent: number
  buyEquity: number
  buyNetCost: number
  cheaper: 'lease' | 'buy'
  difference: number
}

export interface BalloonInput {
  principal: number
  annualRatePercent: number
  termMonths: number
  /** Months paid interest-only before principal repayment starts. */
  interestOnlyMonths: number
  /** Lump sum still owed at the end of the term. */
  balloonAmount: number
}

export interface BalloonResult {
  schedule: AmortizationRow[]
  interestOnlyPayment: number
  amortizingPayment: number
  balloonDue: number
  totalInterest: number
  /** The same loan with no IO period and no balloon, for comparison. */
  vanillaTotalInterest: number
}

export interface SavingsGoalInput {
  target: number
  alreadySaved: number
  monthlyContribution: number
  annualReturnPercent: number
}

export interface SavingsGoalResult {
  months: number | null
  finalBalance: number
  contributed: number
  interestEarned: number
  /** Monthly amount needed to hit the target in a chosen number of months. */
  requiredForMonths: (months: number) => number
}

export interface CarCostInput {
  vehiclePrice: number
  downPayment: number
  annualRatePercent: number
  termMonths: number
  yearsOwned: number
  annualInsurance: number
  annualMaintenance: number
  monthlyFuel: number
  annualDepreciationPercent: number
  annualRegistration: number
}

export interface MoratoriumInput extends LoanInput {
  /**
   * Months at the start of the loan where no payment is made at all. The
   * total repayment term still runs its full length afterward, so the loan
   * finishes this many months later than it otherwise would have.
   */
  moratoriumMonths: number
}

export interface MoratoriumResult {
  /** Balance after interest capitalizes over the moratorium, before EMIs start. */
  balanceAfterMoratorium: number
  capitalizedInterest: number
  /** EMI recalculated over the original term, on the grown post-holiday balance. */
  revisedMonthlyPayment: number
  originalMonthlyPayment: number
  totalInterest: number
  /** Same loan with no moratorium, for comparison. */
  noMoratoriumTotalInterest: number
  schedule: AmortizationRow[]
}

export interface BnplInput {
  purchaseAmount: number
  /** Number of equal installments — "Pay in 4" is 4, some plans run 12+. */
  installments: number
  /** Flat fee charged for the plan, on top of the purchase price. */
  planFee: number
  /** What financing the same purchase would cost instead. */
  loanRatePercent: number
  loanTermMonths: number
  /** Chance of missing a payment and triggering the late fee, 0–100. */
  lateRiskPercent: number
  lateFee: number
}

export interface BnplResult {
  bnplMonthly: number
  bnplTotal: number
  bnplExpectedTotal: number
  loanMonthly: number
  loanTotal: number
  cheaper: 'bnpl' | 'loan'
  difference: number
}

export interface CarCostResult {
  loanInterest: number
  insurance: number
  maintenance: number
  fuel: number
  registration: number
  depreciation: number
  totalCost: number
  costPerMonth: number
  resaleValue: number
}
