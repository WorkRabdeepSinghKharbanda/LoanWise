import { buildAmortizationSchedule, calculateLoan, calculateMonthlyPayment } from './loanMath'
import type {
  AmortizationRow,
  AprResult,
  ArmInput,
  ArmResult,
  BalloonInput,
  BalloonResult,
  BnplInput,
  BnplResult,
  CarCostInput,
  CarCostResult,
  CreditCardInput,
  CreditCardResult,
  FeeInput,
  LeaseVsBuyInput,
  LeaseVsBuyResult,
  LoanInput,
  MoratoriumInput,
  MoratoriumResult,
  PointsOption,
  SavingsGoalInput,
  SavingsGoalResult,
  StudentLoanInput,
  StudentLoanResult,
  TaxReliefResult,
} from '../types/loan'

/** Everything paid on top of principal + interest. Points cost 1% of the loan each. */
export function totalFees(principal: number, fees: FeeInput): number {
  return Math.max(0, fees.originationFee) + Math.max(0, fees.otherFees) + principal * (Math.max(0, fees.points) / 100)
}

/**
 * True APR: the rate at which the payment stream equals the cash the borrower
 * actually received (principal minus fees). Solved by bisection on the monthly
 * rate — the present value of the payments falls monotonically as the rate
 * rises, so bisection converges.
 */
export function calculateApr(input: LoanInput, fees: FeeInput): AprResult {
  const payment = calculateMonthlyPayment(input)
  const feeTotal = totalFees(input.principal, fees)
  const netAdvance = input.principal - feeTotal

  const presentValue = (monthlyRate: number) => {
    if (monthlyRate === 0) return payment * input.termMonths
    return (payment * (1 - Math.pow(1 + monthlyRate, -input.termMonths))) / monthlyRate
  }

  const solvable = netAdvance > 0 && payment > 0 && input.termMonths > 0
  let apr = input.annualRatePercent
  if (solvable) {
    let low = 0
    let high = 1 // 100% a month is far past any real loan.
    for (let i = 0; i < 200; i++) {
      const mid = (low + high) / 2
      if (presentValue(mid) > netAdvance) low = mid
      else high = mid
    }
    apr = ((low + high) / 2) * 12 * 100
  }

  return {
    nominalRatePercent: input.annualRatePercent,
    aprPercent: apr,
    totalFees: feeTotal,
    monthlyPayment: payment,
    feesExceedPrincipal: feeTotal > 0 && netAdvance <= 0,
  }
}

/**
 * Discount points: each point costs 1% of the loan and buys a rate cut.
 * Break-even is when the monthly saving has repaid the points.
 */
export function pointsBuydown(
  input: LoanInput,
  reductionPerPoint = 0.25,
  maxPoints = 3,
): PointsOption[] {
  const baseline = calculateLoan(input)

  return Array.from({ length: maxPoints + 1 }, (_, points) => {
    const ratePercent = Math.max(0, input.annualRatePercent - points * reductionPerPoint)
    const option = { ...input, annualRatePercent: ratePercent }
    const monthlyPayment = calculateMonthlyPayment(option)
    const monthlySaving = baseline.monthlyPayment - monthlyPayment
    const cost = input.principal * (points / 100)
    const totalInterest = calculateLoan(option).totalInterest

    return {
      points,
      ratePercent,
      cost,
      monthlyPayment,
      monthlySaving,
      breakEvenMonths: monthlySaving > 0 ? Math.ceil(cost / monthlySaving) : null,
      totalInterest,
      netSavingOverTerm: baseline.totalInterest - totalInterest - cost,
    }
  })
}

/**
 * Adjustable-rate mortgage: fixed for a period, then the rate resets (capped)
 * and the payment is recast over the remaining term. The point of the tool is
 * the payment shock at reset.
 */
export function calculateArm(input: ArmInput): ArmResult {
  const { principal, initialRatePercent, fixedMonths, resetRatePercent, termMonths, periodicCapPercent } = input

  // The cap limits how far the rate can jump at the reset, in either direction.
  const cappedResetRate = Math.min(
    initialRatePercent + periodicCapPercent,
    Math.max(initialRatePercent - periodicCapPercent, resetRatePercent),
  )

  const initialPayment = calculateMonthlyPayment({ principal, annualRatePercent: initialRatePercent, termMonths })
  const schedule: AmortizationRow[] = []
  let balance = principal
  let payment = initialPayment
  let resetPayment = initialPayment

  for (let month = 1; month <= termMonths && balance > 0; month++) {
    if (month === fixedMonths + 1) {
      // Recast the payment over whatever term is left at the new rate.
      resetPayment = calculateMonthlyPayment({
        principal: balance,
        annualRatePercent: cappedResetRate,
        termMonths: termMonths - fixedMonths,
      })
      payment = resetPayment
    }

    const rate = (month <= fixedMonths ? initialRatePercent : cappedResetRate) / 100 / 12
    const interestPaid = balance * rate
    const principalPaid = Math.min(balance, Math.max(0, payment - interestPaid))
    balance -= principalPaid
    if (balance < 0.005) balance = 0
    schedule.push({ month, payment: principalPaid + interestPaid, principalPaid, interestPaid, balance })
  }

  return {
    schedule,
    initialPayment,
    resetPayment,
    paymentShock: resetPayment - initialPayment,
    paymentShockPercent: initialPayment > 0 ? ((resetPayment - initialPayment) / initialPayment) * 100 : 0,
    cappedResetRate,
    totalInterest: schedule.reduce((sum, row) => sum + row.interestPaid, 0),
  }
}

/**
 * Interest relief on mortgage interest (US itemized deduction, India §24).
 * Only interest up to the annual cap is deductible.
 */
export function calculateTaxRelief(
  schedule: AmortizationRow[],
  marginalRatePercent: number,
  annualDeductionCap = Infinity,
): TaxReliefResult {
  const grossInterest = schedule.reduce((sum, row) => sum + row.interestPaid, 0)

  // Cap applies per tax year, so walk the schedule in 12-month blocks.
  let deductibleInterest = 0
  for (let i = 0; i < schedule.length; i += 12) {
    const yearInterest = schedule.slice(i, i + 12).reduce((sum, row) => sum + row.interestPaid, 0)
    deductibleInterest += Math.min(yearInterest, annualDeductionCap)
  }

  const taxSaved = deductibleInterest * (marginalRatePercent / 100)
  const netInterest = grossInterest - taxSaved

  return {
    grossInterest,
    deductibleInterest,
    taxSaved,
    netInterest,
    // What the loan effectively costs once relief is counted.
    effectiveRatePercent: grossInterest > 0 ? (netInterest / grossInterest) * 100 : 0,
  }
}

function runCardBalance(balance: number, aprPercent: number, paymentFor: (balance: number) => number) {
  const monthlyRate = aprPercent / 100 / 12
  const balanceByMonth: number[] = []
  let totalInterest = 0
  let totalPaid = 0
  let months = 0
  const MAX_MONTHS = 1200 // 100 years — anything hitting this never pays off.

  while (balance > 0 && months < MAX_MONTHS) {
    months++
    const interest = balance * monthlyRate
    balance += interest
    totalInterest += interest

    const payment = Math.min(balance, paymentFor(balance))
    // A payment that cannot cover the interest means the balance grows forever.
    if (payment <= interest && balance > payment) {
      balanceByMonth.push(balance)
      return { months: MAX_MONTHS, totalInterest, totalPaid, balanceByMonth, neverPaysOff: true }
    }

    balance -= payment
    totalPaid += payment
    if (balance < 0.005) balance = 0
    balanceByMonth.push(balance)
  }

  return { months, totalInterest, totalPaid, balanceByMonth, neverPaysOff: months >= MAX_MONTHS }
}

/**
 * The minimum-payment trap: a minimum set as a percent of the balance shrinks
 * as the balance does, stretching payoff over decades.
 */
export function calculateCreditCardPayoff(input: CreditCardInput): CreditCardResult {
  const { balance, aprPercent, minimumPercent, minimumFloor, fixedPayment } = input

  const minimumOnly = runCardBalance(balance, aprPercent, (b) =>
    Math.max(Math.min(b, minimumFloor), b * (minimumPercent / 100)),
  )
  const fixed = runCardBalance(balance, aprPercent, () => fixedPayment)

  // A plan that never clears has no finite total to compare against — its
  // figures stop at the month the balance started running away. Saying
  // "saves -$1,515" there would be worse than saying nothing.
  const comparable = !minimumOnly.neverPaysOff && !fixed.neverPaysOff

  return {
    minimumOnly,
    fixed,
    monthsSaved: comparable ? minimumOnly.months - fixed.months : null,
    interestSaved: comparable ? minimumOnly.totalInterest - fixed.totalInterest : null,
  }
}

/**
 * Income-driven repayment: pay a share of discretionary income instead of a
 * fixed amount, with the remaining balance forgiven after N months. Payments
 * below the accruing interest mean the balance grows — negative amortization.
 */
export function calculateStudentLoan(input: StudentLoanInput): StudentLoanResult {
  const {
    balance,
    annualRatePercent,
    standardTermMonths,
    annualIncome,
    povertyLine,
    discretionaryPercent,
    annualIncomeGrowthPercent,
    forgivenessMonths,
  } = input

  const standardResult = calculateLoan({ principal: balance, annualRatePercent, termMonths: standardTermMonths })

  const monthlyRate = annualRatePercent / 100 / 12
  const balanceByMonth: number[] = []
  let remaining = balance
  let totalInterest = 0
  let totalPaid = 0
  let months = 0
  let startingPayment = 0
  let negativelyAmortizing = false

  while (remaining > 0 && months < forgivenessMonths) {
    months++
    const year = Math.floor((months - 1) / 12)
    const income = annualIncome * Math.pow(1 + annualIncomeGrowthPercent / 100, year)
    const discretionary = Math.max(0, income - povertyLine)
    const payment = (discretionary * (discretionaryPercent / 100)) / 12
    if (months === 1) startingPayment = payment

    const interest = remaining * monthlyRate
    totalInterest += interest
    if (payment < interest) negativelyAmortizing = true

    // The final month only takes what's left, so count what was actually paid
    // rather than the full scheduled payment.
    const owed = remaining + interest
    const paid = Math.min(payment, owed)
    remaining = owed - paid
    totalPaid += paid
    if (remaining < 0.005) remaining = 0
    balanceByMonth.push(remaining)
  }

  return {
    standard: {
      monthlyPayment: standardResult.monthlyPayment,
      months: standardResult.payoffMonths,
      totalInterest: standardResult.totalInterest,
      totalPaid: standardResult.totalPayment,
    },
    incomeDriven: {
      startingPayment,
      months,
      totalInterest,
      totalPaid,
      // Anything still owed when the clock runs out is written off.
      forgivenAmount: remaining,
      balanceByMonth,
      negativelyAmortizing,
    },
  }
}

/** Lease vs buy: what each really costs once the car you own still has value. */
export function calculateLeaseVsBuy(input: LeaseVsBuyInput): LeaseVsBuyResult {
  const {
    vehiclePrice,
    months,
    leaseMonthlyPayment,
    leaseDownPayment,
    leaseEndFees,
    buyDownPayment,
    buyRatePercent,
    buyTermMonths,
    residualValuePercent,
  } = input

  const leaseTotalCost = leaseDownPayment + leaseMonthlyPayment * months + leaseEndFees

  const financed = Math.max(0, vehiclePrice - buyDownPayment)
  const schedule = buildAmortizationSchedule({
    principal: financed,
    annualRatePercent: buyRatePercent,
    termMonths: buyTermMonths,
  })
  const monthsPaid = Math.min(months, schedule.length)
  const paid = schedule.slice(0, monthsPaid).reduce((sum, row) => sum + row.payment, 0)
  const balanceLeft = schedule[monthsPaid - 1]?.balance ?? 0

  const buyCashSpent = buyDownPayment + paid
  // You keep the car: its resale value less anything still owed on it.
  const buyEquity = vehiclePrice * (residualValuePercent / 100) - balanceLeft
  const buyNetCost = buyCashSpent - buyEquity

  return {
    leaseTotalCost,
    buyCashSpent,
    buyEquity,
    buyNetCost,
    cheaper: buyNetCost <= leaseTotalCost ? 'buy' : 'lease',
    difference: Math.abs(buyNetCost - leaseTotalCost),
  }
}

/**
 * Interest-only period and/or a balloon left at the end. Both keep the monthly
 * payment down and hand you a bill later.
 */
export function calculateBalloonLoan(input: BalloonInput): BalloonResult {
  const { principal, annualRatePercent, termMonths, interestOnlyMonths, balloonAmount } = input
  const monthlyRate = annualRatePercent / 100 / 12
  const io = Math.min(Math.max(0, interestOnlyMonths), termMonths - 1)
  const balloon = Math.min(Math.max(0, balloonAmount), principal)

  const interestOnlyPayment = principal * monthlyRate
  const amortizingMonths = termMonths - io

  // Amortize only down to the balloon, not to zero.
  const amortizingPayment =
    monthlyRate === 0
      ? (principal - balloon) / amortizingMonths
      : ((principal - balloon * Math.pow(1 + monthlyRate, -amortizingMonths)) * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -amortizingMonths))

  const schedule: AmortizationRow[] = []
  let balance = principal

  for (let month = 1; month <= termMonths; month++) {
    const interestPaid = balance * monthlyRate
    const inIoPeriod = month <= io
    const payment = inIoPeriod ? interestOnlyPayment : amortizingPayment
    const principalPaid = inIoPeriod ? 0 : Math.min(balance, Math.max(0, payment - interestPaid))
    balance -= principalPaid
    if (balance < 0.005) balance = 0
    schedule.push({ month, payment: principalPaid + interestPaid, principalPaid, interestPaid, balance })
    if (balance === 0) break
  }

  const vanilla = calculateLoan({ principal, annualRatePercent, termMonths })

  return {
    schedule,
    interestOnlyPayment,
    amortizingPayment,
    // Whatever principal is still standing when the term ends.
    balloonDue: schedule[schedule.length - 1]?.balance ?? 0,
    totalInterest: schedule.reduce((sum, row) => sum + row.interestPaid, 0),
    vanillaTotalInterest: vanilla.totalInterest,
  }
}

/** How long a savings goal takes, and what it takes to hit a deadline. */
export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const { target, alreadySaved, monthlyContribution, annualReturnPercent } = input
  const monthlyReturn = annualReturnPercent / 100 / 12

  let balance = alreadySaved
  let contributed = 0
  let months = 0
  const MAX_MONTHS = 1200

  while (balance < target && months < MAX_MONTHS) {
    months++
    balance = balance * (1 + monthlyReturn) + monthlyContribution
    contributed += monthlyContribution
  }

  const reached = balance >= target

  /** Payment needed to reach the target in exactly `n` months (future value of an annuity). */
  const requiredForMonths = (n: number) => {
    if (n <= 0) return 0
    const grown = alreadySaved * Math.pow(1 + monthlyReturn, n)
    const shortfall = target - grown
    if (shortfall <= 0) return 0
    if (monthlyReturn === 0) return shortfall / n
    return (shortfall * monthlyReturn) / (Math.pow(1 + monthlyReturn, n) - 1)
  }

  return {
    months: reached ? months : null,
    finalBalance: balance,
    contributed,
    interestEarned: balance - alreadySaved - contributed,
    requiredForMonths,
  }
}

/** Total cost of owning a car — the loan is usually the smaller half. */
export function calculateCarCost(input: CarCostInput): CarCostResult {
  const {
    vehiclePrice,
    downPayment,
    annualRatePercent,
    termMonths,
    yearsOwned,
    annualInsurance,
    annualMaintenance,
    monthlyFuel,
    annualDepreciationPercent,
    annualRegistration,
  } = input

  const financed = Math.max(0, vehiclePrice - downPayment)
  const schedule = buildAmortizationSchedule({ principal: financed, annualRatePercent, termMonths })
  const monthsOwned = yearsOwned * 12
  const loanInterest = schedule.slice(0, Math.min(monthsOwned, schedule.length)).reduce((s, r) => s + r.interestPaid, 0)

  const resaleValue = vehiclePrice * Math.pow(1 - annualDepreciationPercent / 100, yearsOwned)
  const depreciation = vehiclePrice - resaleValue

  const insurance = annualInsurance * yearsOwned
  const maintenance = annualMaintenance * yearsOwned
  const fuel = monthlyFuel * monthsOwned
  const registration = annualRegistration * yearsOwned

  const totalCost = loanInterest + insurance + maintenance + fuel + registration + depreciation

  return {
    loanInterest,
    insurance,
    maintenance,
    fuel,
    registration,
    depreciation,
    totalCost,
    costPerMonth: monthsOwned > 0 ? totalCost / monthsOwned : 0,
    resaleValue,
  }
}

/**
 * Payment moratorium / EMI holiday: no payment is made for the first N
 * months, but interest keeps accruing and is added to the principal
 * (capitalized). The full repayment term still runs its original length
 * *after* the holiday — that's what an EMI holiday means in practice, the
 * lender pushes your whole schedule back rather than shrinking it — so the
 * loan simply finishes N months later than it otherwise would have, on a
 * larger balance.
 */
export function calculateMoratorium(input: MoratoriumInput): MoratoriumResult {
  const { principal, annualRatePercent, termMonths, moratoriumMonths } = input
  const monthlyRate = annualRatePercent / 100 / 12
  const months = Math.max(0, moratoriumMonths)

  // Interest compounds monthly during the holiday since nothing is paid down.
  const balanceAfterMoratorium = principal * Math.pow(1 + monthlyRate, months)
  const capitalizedInterest = balanceAfterMoratorium - principal

  const revisedMonthlyPayment = calculateMonthlyPayment({
    principal: balanceAfterMoratorium,
    annualRatePercent,
    termMonths,
  })

  const paymentSchedule = buildAmortizationSchedule({
    principal: balanceAfterMoratorium,
    annualRatePercent,
    termMonths,
  })

  // Represent the holiday months as zero-payment rows so the schedule still
  // starts from month 1 and reads naturally in the UI.
  const holidayRows: AmortizationRow[] = Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    payment: 0,
    principalPaid: 0,
    interestPaid: 0,
    balance: principal * Math.pow(1 + monthlyRate, i + 1),
  }))
  const schedule = [...holidayRows, ...paymentSchedule.map((row) => ({ ...row, month: row.month + months }))]

  const noMoratorium = calculateLoan({ principal, annualRatePercent, termMonths })

  return {
    balanceAfterMoratorium,
    capitalizedInterest,
    revisedMonthlyPayment,
    originalMonthlyPayment: calculateMonthlyPayment({ principal, annualRatePercent, termMonths }),
    totalInterest: schedule.reduce((sum, row) => sum + row.interestPaid, 0),
    noMoratoriumTotalInterest: noMoratorium.totalInterest,
    schedule,
  }
}

/**
 * "0% now, pay later" vs. financing the purchase on a loan or card. BNPL looks
 * free, but a plan fee plus the real chance of a late fee can make it cost
 * more than a straightforward loan — this counts the expected cost of both.
 */
export function calculateBnplVsLoan(input: BnplInput): BnplResult {
  const { purchaseAmount, installments, planFee, loanRatePercent, loanTermMonths, lateRiskPercent, lateFee } = input

  const n = Math.max(1, installments)
  const bnplTotal = purchaseAmount + planFee
  const bnplMonthly = bnplTotal / n
  // Expected cost folds in the chance of at least one late fee across the plan.
  const missChance = Math.min(1, Math.max(0, lateRiskPercent) / 100)
  const bnplExpectedTotal = bnplTotal + missChance * lateFee

  const loan = calculateLoan({ principal: purchaseAmount, annualRatePercent: loanRatePercent, termMonths: loanTermMonths })

  return {
    bnplMonthly,
    bnplTotal,
    bnplExpectedTotal,
    loanMonthly: loan.monthlyPayment,
    loanTotal: loan.totalPayment,
    cheaper: bnplExpectedTotal <= loan.totalPayment ? 'bnpl' : 'loan',
    difference: Math.abs(bnplExpectedTotal - loan.totalPayment),
  }
}

/** What a future amount is worth in today's money. */
export function realValue(nominal: number, annualInflationPercent: number, months: number): number {
  return nominal / Math.pow(1 + annualInflationPercent / 100, months / 12)
}

/** Cost of paying a loan off early, when the lender charges for it. */
export function prepaymentPenalty(
  balanceAtPayoff: number,
  penaltyPercent: number,
  payoffMonth: number,
  penaltyWindowMonths: number,
): number {
  if (payoffMonth > penaltyWindowMonths) return 0
  return balanceAtPayoff * (penaltyPercent / 100)
}
