import { describe, expect, it } from 'vitest'
import {
  calculateApr,
  calculateArm,
  calculateBalloonLoan,
  calculateBnplVsLoan,
  calculateCarCost,
  calculateCreditCardPayoff,
  calculateLeaseVsBuy,
  calculateMoratorium,
  calculateSavingsGoal,
  calculateStudentLoan,
  calculateTaxRelief,
  pointsBuydown,
  prepaymentPenalty,
  realValue,
  totalFees,
} from './advancedMath'
import { buildAmortizationSchedule, calculateLoan, calculateMonthlyPayment, monthLabel } from './loanMath'

const LOAN = { principal: 300000, annualRatePercent: 6.5, termMonths: 360 }

describe('totalFees', () => {
  it('counts points as a percent of the loan', () => {
    expect(totalFees(300000, { originationFee: 1000, points: 2, otherFees: 500 })).toBe(1000 + 500 + 6000)
  })

  it('ignores negative inputs', () => {
    expect(totalFees(1000, { originationFee: -50, points: -1, otherFees: 0 })).toBe(0)
  })
})

describe('calculateApr', () => {
  it('equals the nominal rate when there are no fees', () => {
    const result = calculateApr(LOAN, { originationFee: 0, points: 0, otherFees: 0 })
    expect(result.aprPercent).toBeCloseTo(6.5, 2)
  })

  it('rises above the nominal rate once fees are charged', () => {
    const result = calculateApr(LOAN, { originationFee: 3000, points: 1, otherFees: 1200 })
    expect(result.aprPercent).toBeGreaterThan(6.5)
    expect(result.totalFees).toBe(3000 + 1200 + 3000)
  })

  it('rises further as fees grow', () => {
    const small = calculateApr(LOAN, { originationFee: 1000, points: 0, otherFees: 0 })
    const large = calculateApr(LOAN, { originationFee: 9000, points: 0, otherFees: 0 })
    expect(large.aprPercent).toBeGreaterThan(small.aprPercent)
  })
})

describe('pointsBuydown', () => {
  const options = pointsBuydown(LOAN)

  it('offers one row per point, each cheaper monthly than the last', () => {
    expect(options).toHaveLength(4)
    expect(options[0].points).toBe(0)
    expect(options[0].cost).toBe(0)
    expect(options[3].monthlyPayment).toBeLessThan(options[0].monthlyPayment)
  })

  it('has no break-even on the zero-point row', () => {
    expect(options[0].breakEvenMonths).toBeNull()
    expect(options[1].breakEvenMonths).toBeGreaterThan(0)
  })

  it('charges 1% of the loan per point', () => {
    expect(options[2].cost).toBeCloseTo(6000, 2)
  })
})

describe('calculateArm', () => {
  const arm = {
    principal: 300000,
    initialRatePercent: 5,
    fixedMonths: 60,
    resetRatePercent: 8,
    termMonths: 360,
    periodicCapPercent: 2,
  }

  it('caps the reset rate and reports the payment shock', () => {
    const result = calculateArm(arm)
    expect(result.cappedResetRate).toBe(7) // 5% + 2% cap, not the full 8%
    expect(result.resetPayment).toBeGreaterThan(result.initialPayment)
    expect(result.paymentShock).toBeCloseTo(result.resetPayment - result.initialPayment, 6)
    expect(result.paymentShockPercent).toBeGreaterThan(0)
  })

  it('clears the loan by the end of the term', () => {
    const result = calculateArm(arm)
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0)
    expect(result.schedule.length).toBeLessThanOrEqual(360)
  })

  it('behaves like a fixed loan when the rate does not move', () => {
    const result = calculateArm({ ...arm, resetRatePercent: 5 })
    expect(result.paymentShock).toBeCloseTo(0, 2)
    expect(result.totalInterest).toBeCloseTo(
      calculateLoan({ principal: 300000, annualRatePercent: 5, termMonths: 360 }).totalInterest,
      0,
    )
  })

  it('drops the payment when the reset is downward', () => {
    const result = calculateArm({ ...arm, resetRatePercent: 3 })
    expect(result.cappedResetRate).toBe(3)
    expect(result.paymentShock).toBeLessThan(0)
  })
})

describe('calculateTaxRelief', () => {
  const schedule = buildAmortizationSchedule(LOAN)

  it('saves the marginal rate on all interest when uncapped', () => {
    const result = calculateTaxRelief(schedule, 30)
    expect(result.deductibleInterest).toBeCloseTo(result.grossInterest, 2)
    expect(result.taxSaved).toBeCloseTo(result.grossInterest * 0.3, 2)
    expect(result.netInterest).toBeLessThan(result.grossInterest)
  })

  it('honours an annual cap', () => {
    const capped = calculateTaxRelief(schedule, 30, 2000)
    expect(capped.deductibleInterest).toBeLessThan(capped.grossInterest)
    // 30 years of payments, capped at 2000 of interest each.
    expect(capped.deductibleInterest).toBeLessThanOrEqual(2000 * 30)
  })

  it('saves nothing at a 0% marginal rate', () => {
    const result = calculateTaxRelief(schedule, 0)
    expect(result.taxSaved).toBe(0)
    expect(result.netInterest).toBeCloseTo(result.grossInterest, 6)
  })
})

describe('calculateCreditCardPayoff', () => {
  // A 4% minimum clears (slowly); 2% at this APR never does — see below.
  const input = { balance: 6000, aprPercent: 22.9, minimumPercent: 4, minimumFloor: 25, fixedPayment: 300 }

  it('takes far longer on the minimum than on a fixed payment', () => {
    const result = calculateCreditCardPayoff(input)
    expect(result.minimumOnly.months).toBeGreaterThan(result.fixed.months)
    expect(result.interestSaved).toBeGreaterThan(0)
    expect(result.monthsSaved).toBeGreaterThan(0)
  })

  it('reports no comparison when a 2% minimum barely outruns the interest', () => {
    // 2% of the balance against 1.9% monthly interest pays down ~0.09% a month,
    // which does not clear a card inside the 100-year horizon.
    const result = calculateCreditCardPayoff({ ...input, minimumPercent: 2 })
    expect(result.minimumOnly.neverPaysOff).toBe(true)
    expect(result.interestSaved).toBeNull()
  })

  it('clears the balance under a fixed payment', () => {
    const result = calculateCreditCardPayoff(input)
    expect(result.fixed.neverPaysOff).toBe(false)
    expect(result.fixed.balanceByMonth[result.fixed.balanceByMonth.length - 1]).toBe(0)
  })

  it('flags a payment that cannot even cover the interest', () => {
    const result = calculateCreditCardPayoff({ ...input, fixedPayment: 10 })
    expect(result.fixed.neverPaysOff).toBe(true)
  })
})

describe('calculateStudentLoan', () => {
  const input = {
    balance: 60000,
    annualRatePercent: 6,
    standardTermMonths: 120,
    annualIncome: 45000,
    povertyLine: 15000,
    discretionaryPercent: 10,
    annualIncomeGrowthPercent: 3,
    forgivenessMonths: 240,
  }

  it('starts income-driven payments below the standard payment', () => {
    const result = calculateStudentLoan(input)
    expect(result.incomeDriven.startingPayment).toBeLessThan(result.standard.monthlyPayment)
    expect(result.standard.months).toBe(120)
  })

  it('forgives the remainder when the clock runs out on a low income', () => {
    const result = calculateStudentLoan({ ...input, annualIncome: 22000, annualIncomeGrowthPercent: 0 })
    expect(result.incomeDriven.months).toBe(240)
    expect(result.incomeDriven.forgivenAmount).toBeGreaterThan(0)
    expect(result.incomeDriven.negativelyAmortizing).toBe(true)
  })

  it('clears the loan before forgiveness on a high income', () => {
    const result = calculateStudentLoan({ ...input, annualIncome: 120000 })
    expect(result.incomeDriven.months).toBeLessThan(240)
    expect(result.incomeDriven.forgivenAmount).toBe(0)
  })
})

describe('calculateLeaseVsBuy', () => {
  const input = {
    vehiclePrice: 35000,
    months: 36,
    leaseMonthlyPayment: 450,
    leaseDownPayment: 2500,
    leaseEndFees: 400,
    buyDownPayment: 5000,
    buyRatePercent: 6.5,
    buyTermMonths: 60,
    residualValuePercent: 55,
  }

  it('totals the lease as down payment plus payments plus end fees', () => {
    const result = calculateLeaseVsBuy(input)
    expect(result.leaseTotalCost).toBeCloseTo(2500 + 450 * 36 + 400, 2)
  })

  it('credits the buyer with the equity left in the car', () => {
    const result = calculateLeaseVsBuy(input)
    expect(result.buyEquity).toBeGreaterThan(0)
    expect(result.buyNetCost).toBeLessThan(result.buyCashSpent)
  })

  it('flips to the lease when the car holds no value', () => {
    const result = calculateLeaseVsBuy({ ...input, residualValuePercent: 0 })
    expect(result.cheaper).toBe('lease')
  })
})

describe('calculateBalloonLoan', () => {
  const input = {
    principal: 250000,
    annualRatePercent: 6,
    termMonths: 120,
    interestOnlyMonths: 24,
    balloonAmount: 100000,
  }

  it('pays no principal during the interest-only period', () => {
    const { schedule } = calculateBalloonLoan(input)
    expect(schedule.slice(0, 24).every((row) => row.principalPaid === 0)).toBe(true)
    expect(schedule[23].balance).toBeCloseTo(250000, 2)
  })

  it('leaves the balloon outstanding at the end of the term', () => {
    const result = calculateBalloonLoan(input)
    expect(result.balloonDue).toBeCloseTo(100000, 0)
  })

  it('costs more interest than the same loan fully amortized', () => {
    const result = calculateBalloonLoan(input)
    expect(result.totalInterest).toBeGreaterThan(result.vanillaTotalInterest)
  })

  it('amortizes to zero with no interest-only period and no balloon', () => {
    const result = calculateBalloonLoan({ ...input, interestOnlyMonths: 0, balloonAmount: 0 })
    expect(result.balloonDue).toBe(0)
    expect(result.amortizingPayment).toBeCloseTo(
      calculateMonthlyPayment({ principal: 250000, annualRatePercent: 6, termMonths: 120 }),
      2,
    )
  })
})

describe('calculateSavingsGoal', () => {
  const input = { target: 60000, alreadySaved: 10000, monthlyContribution: 800, annualReturnPercent: 6 }

  it('reaches the goal and earns interest along the way', () => {
    const result = calculateSavingsGoal(input)
    expect(result.months).not.toBeNull()
    expect(result.finalBalance).toBeGreaterThanOrEqual(60000)
    expect(result.interestEarned).toBeGreaterThan(0)
  })

  it('never reaches a goal with no contributions and no return', () => {
    const result = calculateSavingsGoal({ ...input, monthlyContribution: 0, annualReturnPercent: 0 })
    expect(result.months).toBeNull()
  })

  it('solves the contribution needed for a deadline', () => {
    const result = calculateSavingsGoal(input)
    const needed = result.requiredForMonths(36)
    const check = calculateSavingsGoal({ ...input, monthlyContribution: needed })
    expect(check.months).toBeLessThanOrEqual(36)
  })

  it('needs nothing more when the existing pot already grows past the target', () => {
    const result = calculateSavingsGoal({ target: 1000, alreadySaved: 5000, monthlyContribution: 0, annualReturnPercent: 5 })
    expect(result.requiredForMonths(12)).toBe(0)
  })
})

describe('calculateCarCost', () => {
  const input = {
    vehiclePrice: 35000,
    downPayment: 5000,
    annualRatePercent: 6.5,
    termMonths: 60,
    yearsOwned: 5,
    annualInsurance: 1400,
    annualMaintenance: 700,
    monthlyFuel: 150,
    annualDepreciationPercent: 15,
    annualRegistration: 200,
  }

  it('adds every component into the total', () => {
    const result = calculateCarCost(input)
    const sum =
      result.loanInterest + result.insurance + result.maintenance + result.fuel + result.registration + result.depreciation
    expect(result.totalCost).toBeCloseTo(sum, 2)
    expect(result.costPerMonth).toBeCloseTo(result.totalCost / 60, 2)
  })

  it('makes depreciation the biggest single cost here', () => {
    const result = calculateCarCost(input)
    expect(result.depreciation).toBeGreaterThan(result.loanInterest)
    expect(result.resaleValue).toBeLessThan(35000)
  })
})

describe('calculateMoratorium', () => {
  const input = { principal: 300000, annualRatePercent: 6, termMonths: 120, moratoriumMonths: 6 }

  it('capitalizes interest during the holiday, raising the balance', () => {
    const result = calculateMoratorium(input)
    expect(result.balanceAfterMoratorium).toBeGreaterThan(300000)
    expect(result.capitalizedInterest).toBeGreaterThan(0)
    expect(result.balanceAfterMoratorium - 300000).toBeCloseTo(result.capitalizedInterest, 6)
  })

  it('raises the EMI above what it would have been with no holiday', () => {
    const result = calculateMoratorium(input)
    expect(result.revisedMonthlyPayment).toBeGreaterThan(result.originalMonthlyPayment)
  })

  it('produces zero-payment rows for the holiday, then the full term after', () => {
    const result = calculateMoratorium(input)
    expect(result.schedule.slice(0, 6).every((row) => row.payment === 0)).toBe(true)
    expect(result.schedule[6].payment).toBeGreaterThan(0)
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0)
    // The holiday extends the loan's total life by its own length.
    expect(result.schedule).toHaveLength(120 + 6)
  })

  it('costs more total interest than the same loan with no moratorium', () => {
    const result = calculateMoratorium(input)
    expect(result.totalInterest).toBeGreaterThan(result.noMoratoriumTotalInterest)
  })

  it('degenerates to the plain loan at 0 moratorium months', () => {
    const result = calculateMoratorium({ ...input, moratoriumMonths: 0 })
    expect(result.revisedMonthlyPayment).toBeCloseTo(result.originalMonthlyPayment, 6)
    expect(result.capitalizedInterest).toBe(0)
  })

  it('handles a long holiday by extending the schedule to match', () => {
    const result = calculateMoratorium({ ...input, moratoriumMonths: 120 })
    expect(result.schedule).toHaveLength(120 + 120)
    expect(result.schedule[result.schedule.length - 1].payment).toBeGreaterThan(0)
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0)
  })
})

describe('calculateBnplVsLoan', () => {
  const base = {
    purchaseAmount: 1200,
    installments: 4,
    planFee: 0,
    loanRatePercent: 22,
    loanTermMonths: 12,
    lateRiskPercent: 0,
    lateFee: 0,
  }

  it('favours a fee-free BNPL plan over a high-rate loan', () => {
    const result = calculateBnplVsLoan(base)
    expect(result.bnplTotal).toBe(1200)
    expect(result.bnplMonthly).toBe(300)
    expect(result.cheaper).toBe('bnpl')
    expect(result.loanTotal).toBeGreaterThan(1200)
  })

  it('folds late-fee risk into the expected cost', () => {
    const risky = calculateBnplVsLoan({ ...base, lateRiskPercent: 50, lateFee: 40 })
    expect(risky.bnplExpectedTotal).toBeCloseTo(1200 + 0.5 * 40, 2)
    expect(risky.bnplExpectedTotal).toBeGreaterThan(risky.bnplTotal)
  })

  it('can flip to the loan once a plan fee is added', () => {
    const withFee = calculateBnplVsLoan({ ...base, planFee: 5000, loanRatePercent: 3, loanTermMonths: 3 })
    expect(withFee.cheaper).toBe('loan')
  })
})

describe('realValue', () => {
  it('discounts a future amount back to today', () => {
    expect(realValue(1000, 5, 12)).toBeCloseTo(1000 / 1.05, 4)
  })

  it('changes nothing at 0% inflation', () => {
    expect(realValue(1000, 0, 120)).toBe(1000)
  })
})

describe('prepaymentPenalty', () => {
  it('charges inside the window and nothing outside it', () => {
    expect(prepaymentPenalty(100000, 2, 12, 36)).toBeCloseTo(2000, 2)
    expect(prepaymentPenalty(100000, 2, 48, 36)).toBe(0)
  })
})

describe('monthLabel', () => {
  it('counts calendar months from the start date', () => {
    expect(monthLabel(1, '2026-01')).toBe('Jan 2026')
    expect(monthLabel(13, '2026-01')).toBe('Jan 2027')
  })

  it('falls back to the payment number on a bad date', () => {
    expect(monthLabel(7, 'not-a-date')).toBe('7')
  })
})

describe('annual extra payment', () => {
  it('shortens the loan without a monthly increase', () => {
    const plain = calculateLoan(LOAN)
    const withBonus = calculateLoan({ ...LOAN, annualExtraPayment: 5000 })
    expect(withBonus.payoffMonths).toBeLessThan(plain.payoffMonths)
    expect(withBonus.interestSaved).toBeGreaterThan(0)
    // The scheduled monthly payment itself is unchanged.
    expect(withBonus.monthlyPayment).toBeCloseTo(plain.monthlyPayment, 6)
  })
})
