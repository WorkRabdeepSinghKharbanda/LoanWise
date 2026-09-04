import type {
  AffordabilityInput,
  AffordabilityResult,
  AmortizationRow,
  Debt,
  DebtPayoffResult,
  LoanInput,
  LoanResult,
  PayoffStrategy,
  PrepayVsInvestResult,
  RateSensitivityRow,
  RefinanceInput,
  RefinanceResult,
  RentVsBuyInput,
  RentVsBuyResult,
  RentVsBuyYear,
  StepUpInput,
  YearSummary,
} from '../types/loan'

/** Scheduled level payment for a fully amortizing loan. */
export function calculateMonthlyPayment({ principal, annualRatePercent, termMonths }: LoanInput): number {
  if (termMonths <= 0 || principal <= 0) return 0
  const monthlyRate = annualRatePercent / 100 / 12
  if (monthlyRate === 0) return principal / termMonths
  const factor = Math.pow(1 + monthlyRate, termMonths)
  return (principal * monthlyRate * factor) / (factor - 1)
}

/**
 * Month-by-month schedule. An extraMonthlyPayment goes straight to principal,
 * so the loan closes before termMonths and the schedule is shorter.
 */
export function buildAmortizationSchedule(input: LoanInput): AmortizationRow[] {
  const { principal, annualRatePercent, termMonths } = input
  const extra = Math.max(0, input.extraMonthlyPayment ?? 0)
  const lumpAmount = Math.max(0, input.lumpSumAmount ?? 0)
  // Default to month 12 — the same default the URL state and the prepayment
  // panel use, so an unset month never silently lands the lump in month 1.
  const lumpMonth = Math.max(1, input.lumpSumMonth ?? 12)
  if (principal <= 0 || termMonths <= 0) return []

  const annualExtra = Math.max(0, input.annualExtraPayment ?? 0)
  const monthlyRate = annualRatePercent / 100 / 12
  const scheduled = calculateMonthlyPayment({ principal, annualRatePercent, termMonths })
  const schedule: AmortizationRow[] = []
  let balance = principal

  for (let month = 1; month <= termMonths && balance > 0; month++) {
    const interestPaid = balance * monthlyRate
    const lump = lumpAmount > 0 && month === lumpMonth ? lumpAmount : 0
    // An annual bonus lands every 12th month.
    const bonus = annualExtra > 0 && month % 12 === 0 ? annualExtra : 0
    // Never pay more principal than is left, and close out on the final scheduled month.
    const principalPaid = Math.min(balance, Math.max(0, scheduled + extra + lump + bonus - interestPaid))
    balance = balance - principalPaid
    // Floating point dust: treat a sub-cent balance as paid off.
    if (balance < 0.005) balance = 0
    schedule.push({ month, payment: principalPaid + interestPaid, principalPaid, interestPaid, balance })
  }

  return schedule
}

function summarize(schedule: AmortizationRow[]) {
  return schedule.reduce(
    (acc, row) => ({
      totalPayment: acc.totalPayment + row.payment,
      totalInterest: acc.totalInterest + row.interestPaid,
    }),
    { totalPayment: 0, totalInterest: 0 },
  )
}

export function calculateLoan(input: LoanInput): LoanResult {
  const schedule = buildAmortizationSchedule(input)
  const { totalPayment, totalInterest } = summarize(schedule)
  const extra = Math.max(0, input.extraMonthlyPayment ?? 0)

  const lump = Math.max(0, input.lumpSumAmount ?? 0)
  const annualExtra = Math.max(0, input.annualExtraPayment ?? 0)

  let interestSaved = 0
  let monthsSaved = 0
  if (extra > 0 || lump > 0 || annualExtra > 0) {
    const baseline = buildAmortizationSchedule({
      ...input,
      extraMonthlyPayment: 0,
      lumpSumAmount: 0,
      annualExtraPayment: 0,
    })
    interestSaved = summarize(baseline).totalInterest - totalInterest
    monthsSaved = baseline.length - schedule.length
  }

  return {
    monthlyPayment: calculateMonthlyPayment(input),
    totalPayment,
    totalInterest,
    schedule,
    payoffMonths: schedule.length,
    interestSaved,
    monthsSaved,
  }
}

/**
 * Step-up EMI: the payment rises by annualStepUpPercent every 12 months.
 * Returns the schedule for a given starting payment (may not fully close the loan).
 */
function stepUpSchedule(input: StepUpInput, initialPayment: number): AmortizationRow[] {
  const { principal, annualRatePercent, termMonths, annualStepUpPercent } = input
  const monthlyRate = annualRatePercent / 100 / 12
  const rows: AmortizationRow[] = []
  let balance = principal

  for (let month = 1; month <= termMonths && balance > 0; month++) {
    const year = Math.floor((month - 1) / 12)
    const payment = initialPayment * Math.pow(1 + annualStepUpPercent / 100, year)
    const interestPaid = balance * monthlyRate
    const principalPaid = Math.min(balance, Math.max(0, payment - interestPaid))
    balance = balance - principalPaid
    if (balance < 0.005) balance = 0
    rows.push({ month, payment: principalPaid + interestPaid, principalPaid, interestPaid, balance })
  }

  return rows
}

/**
 * Solves for the starting payment that closes a step-up loan exactly at term.
 * Remaining balance falls monotonically as the starting payment rises, so a
 * binary search is exact enough and cheap.
 */
export function calculateStepUpLoan(input: StepUpInput): LoanResult {
  const flat = calculateMonthlyPayment(input)
  // Nothing to solve for a degenerate loan — and the bisection below would
  // otherwise converge on its seed and report a payment of 1.
  if (flat <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      schedule: [],
      payoffMonths: 0,
      interestSaved: 0,
      monthsSaved: 0,
    }
  }

  let low = 0
  let high = flat * 2

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2
    const rows = stepUpSchedule(input, mid)
    const closed = rows.length > 0 && rows[rows.length - 1].balance === 0
    if (closed) high = mid
    else low = mid
  }

  const schedule = stepUpSchedule(input, high)
  const { totalPayment, totalInterest } = summarize(schedule)
  const flatInterest = summarize(buildAmortizationSchedule({ ...input, extraMonthlyPayment: 0 })).totalInterest

  return {
    monthlyPayment: high,
    totalPayment,
    totalInterest,
    schedule,
    payoffMonths: schedule.length,
    // Positive when the step-up plan costs LESS interest than a flat EMI.
    interestSaved: flatInterest - totalInterest,
    monthsSaved: 0,
  }
}

/** Largest loan whose payment fits inside the borrower's DTI headroom. */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { monthlyIncome, existingMonthlyDebt, dtiPercent, annualRatePercent, termMonths, downPayment } = input
  const maxMonthlyPayment = Math.max(0, (monthlyIncome * dtiPercent) / 100 - existingMonthlyDebt)
  const monthlyRate = annualRatePercent / 100 / 12

  let maxLoanAmount = 0
  if (maxMonthlyPayment > 0 && termMonths > 0) {
    if (monthlyRate === 0) maxLoanAmount = maxMonthlyPayment * termMonths
    else {
      const factor = Math.pow(1 + monthlyRate, termMonths)
      maxLoanAmount = (maxMonthlyPayment * (factor - 1)) / (monthlyRate * factor)
    }
  }

  return { maxMonthlyPayment, maxLoanAmount, maxHomePrice: maxLoanAmount + Math.max(0, downPayment) }
}

/**
 * Cumulative cost of renting vs. buying, year by year.
 * Buying cost = cash out the door (down payment + payments + tax/insurance)
 * minus equity recovered at sale (home value − remaining mortgage balance).
 */
export function calculateRentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const {
    homePrice,
    downPayment,
    annualRatePercent,
    termMonths,
    monthlyRent,
    annualRentGrowthPercent,
    annualAppreciationPercent,
    annualTaxInsurancePercent,
    yearsToStay,
  } = input

  const financed = Math.max(0, homePrice - downPayment)
  const schedule = buildAmortizationSchedule({ principal: financed, annualRatePercent, termMonths })
  const years: RentVsBuyYear[] = []

  let cumulativeRent = 0
  let cumulativePaid = downPayment

  for (let year = 1; year <= Math.max(1, yearsToStay); year++) {
    cumulativeRent += monthlyRent * 12 * Math.pow(1 + annualRentGrowthPercent / 100, year - 1)

    const monthsElapsed = Math.min(year * 12, schedule.length)
    const paidSoFar = schedule.slice(0, monthsElapsed).reduce((sum, row) => sum + row.payment, 0)
    const homeValue = homePrice * Math.pow(1 + annualAppreciationPercent / 100, year)
    const taxInsurance = homePrice * (annualTaxInsurancePercent / 100) * year
    const remainingBalance = schedule[monthsElapsed - 1]?.balance ?? 0
    const equity = homeValue - remainingBalance

    cumulativePaid = downPayment + paidSoFar + taxInsurance
    years.push({ year, rentCost: cumulativeRent, buyCost: cumulativePaid - equity })
  }

  const breakEven = years.find((y) => y.buyCost < y.rentCost)
  const last = years[years.length - 1]

  return {
    years,
    breakEvenYear: breakEven?.year ?? null,
    rentTotal: last?.rentCost ?? 0,
    buyTotal: last?.buyCost ?? 0,
  }
}

/** Month index (1-based) at which the loan balance drops below the PMI threshold. */
export function pmiDropOffMonth(schedule: AmortizationRow[], homeValue: number, equityPercent = 20): number | null {
  if (homeValue <= 0) return null
  const threshold = homeValue * (1 - equityPercent / 100)
  const row = schedule.find((r) => r.balance <= threshold)
  return row?.month ?? null
}

/**
 * Paying half the monthly payment every two weeks means 26 half-payments a year
 * — one extra full payment. Spreading that extra over 12 months is the standard
 * monthly-equivalent approximation (real biweekly interest accrues slightly
 * differently, but the payoff difference is under a month on a 30-year loan).
 */
export function biweeklyExtraEquivalent(monthlyPayment: number): number {
  return monthlyPayment / 12
}

/** Extra monthly payment needed to clear the loan in exactly targetMonths. */
export function extraForTargetMonths(input: LoanInput, targetMonths: number): number {
  if (targetMonths <= 0 || targetMonths >= input.termMonths) return 0
  const scheduled = calculateMonthlyPayment(input)
  const required = calculateMonthlyPayment({ ...input, termMonths: targetMonths })
  return Math.max(0, required - scheduled)
}

/** Payment and interest at nearby rates — the "what if I negotiate" table. */
export function rateSensitivity(input: LoanInput, deltas = [-1, -0.5, -0.25, 0, 0.25, 0.5, 1]): RateSensitivityRow[] {
  const basePayment = calculateMonthlyPayment(input)
  return deltas
    .map((delta) => {
      const ratePercent = Math.max(0, input.annualRatePercent + delta)
      const shifted = { ...input, annualRatePercent: ratePercent }
      const monthlyPayment = calculateMonthlyPayment(shifted)
      return {
        ratePercent,
        delta,
        monthlyPayment,
        totalInterest: calculateLoan(shifted).totalInterest,
        monthlyDelta: monthlyPayment - basePayment,
      }
    })
    .filter((row, i, all) => all.findIndex((r) => r.ratePercent === row.ratePercent) === i)
}

/** Collapses a monthly schedule into one row per 12 months. */
export function summarizeByYear(schedule: AmortizationRow[]): YearSummary[] {
  const years: YearSummary[] = []
  for (let i = 0; i < schedule.length; i += 12) {
    const chunk = schedule.slice(i, i + 12)
    years.push({
      year: Math.floor(i / 12) + 1,
      payment: chunk.reduce((s, r) => s + r.payment, 0),
      principalPaid: chunk.reduce((s, r) => s + r.principalPaid, 0),
      interestPaid: chunk.reduce((s, r) => s + r.interestPaid, 0),
      endingBalance: chunk[chunk.length - 1].balance,
    })
  }
  return years
}

/**
 * Multi-debt payoff. Every debt gets its minimum each month; whatever budget is
 * left over is thrown at one target debt — the smallest balance (snowball) or
 * the highest rate (avalanche). Freed-up minimums roll into the budget as debts
 * clear, which is what makes either strategy accelerate.
 */
export function calculateDebtPayoff(debts: Debt[], monthlyBudget: number, strategy: PayoffStrategy): DebtPayoffResult {
  const live = debts
    .filter((d) => d.balance > 0)
    .map((d) => ({ ...d, remaining: d.balance, interestPaid: 0, clearedMonth: 0 }))

  const order: DebtPayoffResult['order'] = []
  const balanceByMonth: number[] = []
  let totalInterest = 0
  let totalPaid = 0
  let month = 0
  const MAX_MONTHS = 600

  while (live.some((d) => d.remaining > 0) && month < MAX_MONTHS) {
    month++
    let budget = monthlyBudget

    // 1. Interest accrues on every live debt.
    for (const debt of live) {
      if (debt.remaining <= 0) continue
      const interest = debt.remaining * (debt.annualRatePercent / 100 / 12)
      debt.remaining += interest
      debt.interestPaid += interest
      totalInterest += interest
    }

    // 2. Minimums first, so nothing goes delinquent.
    for (const debt of live) {
      if (debt.remaining <= 0) continue
      const pay = Math.min(debt.remaining, debt.minimumPayment, budget)
      debt.remaining -= pay
      budget -= pay
      totalPaid += pay
    }

    // 3. Everything left over attacks the target debt, then the next one.
    const targets = live
      .filter((d) => d.remaining > 0)
      .sort((a, b) => (strategy === 'snowball' ? a.remaining - b.remaining : b.annualRatePercent - a.annualRatePercent))

    for (const debt of targets) {
      if (budget <= 0) break
      const pay = Math.min(debt.remaining, budget)
      debt.remaining -= pay
      budget -= pay
      totalPaid += pay
    }

    for (const debt of live) {
      if (debt.remaining <= 0.005 && debt.clearedMonth === 0) {
        debt.remaining = 0
        debt.clearedMonth = month
        order.push({ name: debt.name, clearedMonth: month, interestPaid: debt.interestPaid })
      }
    }

    balanceByMonth.push(live.reduce((sum, d) => sum + Math.max(0, d.remaining), 0))

    // The budget can't cover the minimums — this plan never pays off.
    if (month > 1 && balanceByMonth[month - 1] >= balanceByMonth[month - 2]) break
  }

  return { strategy, months: month, totalInterest, totalPaid, order, balanceByMonth }
}

/** Refinance break-even: how long until the lower payment repays the closing costs. */
export function calculateRefinance(input: RefinanceInput): RefinanceResult {
  const current = {
    principal: input.currentBalance,
    annualRatePercent: input.currentRatePercent,
    termMonths: input.currentRemainingMonths,
  }
  const next = {
    principal: input.currentBalance,
    annualRatePercent: input.newRatePercent,
    termMonths: input.newTermMonths,
  }

  const currentMonthlyPayment = calculateMonthlyPayment(current)
  const newMonthlyPayment = calculateMonthlyPayment(next)
  const monthlySaving = currentMonthlyPayment - newMonthlyPayment

  const currentTotalInterest = calculateLoan(current).totalInterest
  const newTotalInterest = calculateLoan(next).totalInterest

  return {
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlySaving,
    breakEvenMonths: monthlySaving > 0 ? Math.ceil(input.closingCosts / monthlySaving) : null,
    currentTotalInterest,
    newTotalInterest,
    // Refinancing to a longer term can lower the payment yet cost more overall.
    lifetimeSaving: currentTotalInterest - newTotalInterest - input.closingCosts,
  }
}

/**
 * Prepay the loan or invest the same money? Compares guaranteed interest saved
 * against the projected value of investing that monthly amount instead.
 */
export function comparePrepayVsInvest(
  input: LoanInput,
  monthlyAmount: number,
  annualReturnPercent: number,
): PrepayVsInvestResult {
  const withPrepay = calculateLoan({ ...input, extraMonthlyPayment: monthlyAmount })
  const interestSaved = withPrepay.interestSaved

  // Invest the same amount over the horizon the prepayment would have covered.
  const months = calculateLoan({ ...input, extraMonthlyPayment: 0 }).payoffMonths
  const monthlyReturn = annualReturnPercent / 100 / 12
  let investmentValue = 0
  for (let m = 0; m < months; m++) investmentValue = (investmentValue + monthlyAmount) * (1 + monthlyReturn)
  const investedContributions = monthlyAmount * months
  const investmentGain = investmentValue - investedContributions

  return {
    interestSaved,
    investmentValue,
    investedContributions,
    better: investmentGain > interestSaved ? 'invest' : 'prepay',
    difference: Math.abs(investmentGain - interestSaved),
  }
}

export const CURRENCIES = {
  USD: { label: 'US Dollar', symbol: '$', locale: 'en-US' },
  INR: { label: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  EUR: { label: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { label: 'British Pound', symbol: '£', locale: 'en-GB' },
  AED: { label: 'UAE Dirham', symbol: 'AED', locale: 'en-AE' },
  AUD: { label: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

export function formatCurrency(value: number, currency: CurrencyCode = 'USD'): string {
  const { locale } = CURRENCIES[currency] ?? CURRENCIES.USD
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

/** Compact form for axis ticks — 1.2M, 340K. */
export function formatCompact(value: number, currency: CurrencyCode = 'USD'): string {
  const { locale } = CURRENCIES[currency] ?? CURRENCIES.USD
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} mo`
  if (rest === 0) return `${years} yr`
  return `${years} yr ${rest} mo`
}

/** Calendar month the final payment lands on, starting from next month. */
export function payoffDate(months: number, from = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth() + months, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Calendar label for payment number `monthIndex` (1-based) given a start date. */
export function monthLabel(monthIndex: number, startDate: string): string {
  const start = new Date(`${startDate}-01T00:00:00`)
  if (Number.isNaN(start.getTime())) return String(monthIndex)
  const date = new Date(start.getFullYear(), start.getMonth() + monthIndex - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Current month as `YYYY-MM`, for the schedule start-date input. */
export function currentMonthValue(from = new Date()): string {
  return `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`
}

/** Whole months from startDate to `from` — negative if the schedule hasn't started yet. */
export function monthsElapsedSince(startDate: string, from = new Date()): number {
  const start = new Date(`${startDate}-01T00:00:00`)
  if (Number.isNaN(start.getTime())) return NaN
  return (from.getFullYear() - start.getFullYear()) * 12 + (from.getMonth() - start.getMonth())
}
