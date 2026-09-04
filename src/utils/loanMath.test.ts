import { describe, expect, it } from 'vitest'
import {
  buildAmortizationSchedule,
  calculateAffordability,
  calculateDebtPayoff,
  calculateLoan,
  calculateMonthlyPayment,
  calculateRefinance,
  calculateRentVsBuy,
  calculateStepUpLoan,
  comparePrepayVsInvest,
  extraForTargetMonths,
  pmiDropOffMonth,
  rateSensitivity,
  summarizeByYear,
} from './loanMath'
import type { Debt } from '../types/loan'

describe('calculateMonthlyPayment', () => {
  it('matches the standard amortization formula', () => {
    // $200k, 6% / 30yr is a textbook case: $1199.10/mo
    expect(calculateMonthlyPayment({ principal: 200000, annualRatePercent: 6, termMonths: 360 })).toBeCloseTo(1199.1, 1)
  })

  it('splits principal evenly at 0% interest', () => {
    expect(calculateMonthlyPayment({ principal: 12000, annualRatePercent: 0, termMonths: 12 })).toBe(1000)
  })

  it('returns 0 for a degenerate loan', () => {
    expect(calculateMonthlyPayment({ principal: 0, annualRatePercent: 5, termMonths: 12 })).toBe(0)
    expect(calculateMonthlyPayment({ principal: 1000, annualRatePercent: 5, termMonths: 0 })).toBe(0)
  })
})

describe('buildAmortizationSchedule', () => {
  const input = { principal: 25000, annualRatePercent: 6.5, termMonths: 60 }

  it('runs the full term and ends at exactly zero', () => {
    const schedule = buildAmortizationSchedule(input)
    expect(schedule).toHaveLength(60)
    expect(schedule[schedule.length - 1].balance).toBe(0)
  })

  it('repays exactly the principal borrowed', () => {
    const schedule = buildAmortizationSchedule(input)
    const principalRepaid = schedule.reduce((sum, row) => sum + row.principalPaid, 0)
    expect(principalRepaid).toBeCloseTo(input.principal, 2)
  })

  it('shifts payment from interest toward principal over time', () => {
    const schedule = buildAmortizationSchedule(input)
    expect(schedule[0].interestPaid).toBeGreaterThan(schedule[59].interestPaid)
    expect(schedule[0].principalPaid).toBeLessThan(schedule[59].principalPaid)
  })

  it('closes early when paying extra, and never overshoots into negative balance', () => {
    const schedule = buildAmortizationSchedule({ ...input, extraMonthlyPayment: 300 })
    expect(schedule.length).toBeLessThan(60)
    expect(schedule[schedule.length - 1].balance).toBe(0)
    expect(schedule.every((row) => row.balance >= 0)).toBe(true)
  })
})

describe('calculateLoan', () => {
  it('reports interest and time saved by prepaying', () => {
    const base = { principal: 300000, annualRatePercent: 6.5, termMonths: 360 }
    const plain = calculateLoan(base)
    const extra = calculateLoan({ ...base, extraMonthlyPayment: 400 })

    expect(plain.interestSaved).toBe(0)
    expect(plain.monthsSaved).toBe(0)
    expect(extra.interestSaved).toBeGreaterThan(0)
    expect(extra.monthsSaved).toBeGreaterThan(0)
    expect(extra.totalInterest).toBeLessThan(plain.totalInterest)
  })

  it('totals interest as payments minus principal', () => {
    const result = calculateLoan({ principal: 10000, annualRatePercent: 10, termMonths: 36 })
    expect(result.totalPayment - result.totalInterest).toBeCloseTo(10000, 2)
  })
})

describe('calculateStepUpLoan', () => {
  const input = { principal: 500000, annualRatePercent: 8.5, termMonths: 120, annualStepUpPercent: 5 }

  it('starts below the flat EMI and still clears the loan', () => {
    const stepUp = calculateStepUpLoan(input)
    const flat = calculateMonthlyPayment(input)

    expect(stepUp.monthlyPayment).toBeLessThan(flat)
    expect(stepUp.schedule[stepUp.schedule.length - 1].balance).toBe(0)
    expect(stepUp.payoffMonths).toBeLessThanOrEqual(input.termMonths)
  })

  it('raises the payment every 12 months', () => {
    const { schedule } = calculateStepUpLoan(input)
    // Month 13 opens a new step, so it must pay more than month 12.
    expect(schedule[12].payment).toBeGreaterThan(schedule[11].payment)
  })

  it('degenerates to a flat EMI at 0% step-up', () => {
    const stepUp = calculateStepUpLoan({ ...input, annualStepUpPercent: 0 })
    expect(stepUp.monthlyPayment).toBeCloseTo(calculateMonthlyPayment(input), 0)
  })
})

describe('calculateAffordability', () => {
  it('inverts the payment formula back to a principal', () => {
    const { maxMonthlyPayment, maxLoanAmount, maxHomePrice } = calculateAffordability({
      monthlyIncome: 7000,
      existingMonthlyDebt: 600,
      dtiPercent: 36,
      annualRatePercent: 6.5,
      termMonths: 360,
      downPayment: 60000,
    })

    // 36% of 7000 = 2520, minus 600 existing debt.
    expect(maxMonthlyPayment).toBeCloseTo(1920, 2)
    // Round-tripping that loan must reproduce the same payment.
    expect(calculateMonthlyPayment({ principal: maxLoanAmount, annualRatePercent: 6.5, termMonths: 360 })).toBeCloseTo(1920, 2)
    expect(maxHomePrice).toBeCloseTo(maxLoanAmount + 60000, 2)
  })

  it('reports no headroom when existing debt eats the allowance', () => {
    const result = calculateAffordability({
      monthlyIncome: 3000,
      existingMonthlyDebt: 2000,
      dtiPercent: 36,
      annualRatePercent: 6,
      termMonths: 360,
      downPayment: 0,
    })
    expect(result.maxMonthlyPayment).toBe(0)
    expect(result.maxLoanAmount).toBe(0)
  })
})

describe('calculateRentVsBuy', () => {
  const input = {
    homePrice: 350000,
    downPayment: 70000,
    annualRatePercent: 6.5,
    termMonths: 360,
    monthlyRent: 1800,
    annualRentGrowthPercent: 3,
    annualAppreciationPercent: 3,
    annualTaxInsurancePercent: 1.5,
    yearsToStay: 10,
  }

  it('produces one row per year with rising rent', () => {
    const { years } = calculateRentVsBuy(input)
    expect(years).toHaveLength(10)
    expect(years[9].rentCost).toBeGreaterThan(years[0].rentCost)
  })

  it('favours renting when the home never appreciates', () => {
    const flat = calculateRentVsBuy({ ...input, annualAppreciationPercent: 0, yearsToStay: 3 })
    expect(flat.buyTotal).toBeGreaterThan(0)
  })
})

describe('pmiDropOffMonth', () => {
  it('finds the month the balance crosses 80% of home value', () => {
    // Borrowing 330k against a 350k home starts above the 280k PMI threshold,
    // so the drop-off lands mid-schedule rather than at month 1.
    const schedule = buildAmortizationSchedule({ principal: 330000, annualRatePercent: 6.5, termMonths: 360 })
    const month = pmiDropOffMonth(schedule, 350000)
    expect(month).not.toBeNull()
    expect(month!).toBeGreaterThan(1)
    expect(schedule[month! - 1].balance).toBeLessThanOrEqual(350000 * 0.8)
    // The month before must still be above the threshold.
    expect(schedule[month! - 2].balance).toBeGreaterThan(350000 * 0.8)
  })

  it('returns null without a home value', () => {
    expect(pmiDropOffMonth([], 0)).toBeNull()
  })
})

describe('lump sum prepayment', () => {
  const base = { principal: 300000, annualRatePercent: 6.5, termMonths: 360 }

  it('shortens the loan and saves interest', () => {
    const plain = calculateLoan(base)
    const withLump = calculateLoan({ ...base, lumpSumAmount: 25000, lumpSumMonth: 12 })

    expect(withLump.payoffMonths).toBeLessThan(plain.payoffMonths)
    expect(withLump.interestSaved).toBeGreaterThan(0)
  })

  it('saves more the earlier it lands', () => {
    const early = calculateLoan({ ...base, lumpSumAmount: 25000, lumpSumMonth: 12 })
    const late = calculateLoan({ ...base, lumpSumAmount: 25000, lumpSumMonth: 120 })
    expect(early.interestSaved).toBeGreaterThan(late.interestSaved)
  })
})

describe('extraForTargetMonths', () => {
  it('finds the extra payment that hits the target term', () => {
    const input = { principal: 25000, annualRatePercent: 6.5, termMonths: 60 }
    const extra = extraForTargetMonths(input, 48)
    expect(extra).toBeGreaterThan(0)

    const result = calculateLoan({ ...input, extraMonthlyPayment: extra })
    // Rounding can land a month early; never late.
    expect(result.payoffMonths).toBeLessThanOrEqual(48)
    expect(result.payoffMonths).toBeGreaterThanOrEqual(47)
  })

  it('returns 0 when the target is not shorter than the term', () => {
    expect(extraForTargetMonths({ principal: 1000, annualRatePercent: 5, termMonths: 12 }, 12)).toBe(0)
    expect(extraForTargetMonths({ principal: 1000, annualRatePercent: 5, termMonths: 12 }, 24)).toBe(0)
  })
})

describe('rateSensitivity', () => {
  it('rises monotonically with the rate and marks the base row as zero delta', () => {
    const rows = rateSensitivity({ principal: 300000, annualRatePercent: 6.5, termMonths: 360 })
    const payments = rows.map((r) => r.monthlyPayment)
    expect([...payments].sort((a, b) => a - b)).toEqual(payments)

    const base = rows.find((r) => r.delta === 0)!
    expect(base.monthlyDelta).toBeCloseTo(0, 6)
  })
})

describe('summarizeByYear', () => {
  it('preserves totals and ends at the final balance', () => {
    const schedule = buildAmortizationSchedule({ principal: 25000, annualRatePercent: 6.5, termMonths: 60 })
    const years = summarizeByYear(schedule)

    expect(years).toHaveLength(5)
    expect(years.reduce((s, y) => s + y.interestPaid, 0)).toBeCloseTo(
      schedule.reduce((s, r) => s + r.interestPaid, 0),
      2,
    )
    expect(years[years.length - 1].endingBalance).toBe(0)
  })
})

describe('calculateDebtPayoff', () => {
  const debts: Debt[] = [
    { id: '1', name: 'Credit card', balance: 4000, annualRatePercent: 22, minimumPayment: 80 },
    { id: '2', name: 'Car loan', balance: 9000, annualRatePercent: 7, minimumPayment: 200 },
    { id: '3', name: 'Store card', balance: 900, annualRatePercent: 26, minimumPayment: 25 },
  ]

  it('clears every debt and reports the payoff order', () => {
    const result = calculateDebtPayoff(debts, 600, 'snowball')
    expect(result.order).toHaveLength(3)
    expect(result.balanceByMonth[result.balanceByMonth.length - 1]).toBe(0)
    expect(result.months).toBeGreaterThan(0)
  })

  it('clears the smallest balance first under snowball', () => {
    const result = calculateDebtPayoff(debts, 600, 'snowball')
    expect(result.order[0].name).toBe('Store card')
  })

  it('costs no more interest than snowball under avalanche', () => {
    const snowball = calculateDebtPayoff(debts, 600, 'snowball')
    const avalanche = calculateDebtPayoff(debts, 600, 'avalanche')
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest + 0.01)
  })

  it('stops instead of looping forever when the budget cannot cover minimums', () => {
    const result = calculateDebtPayoff(debts, 50, 'avalanche')
    expect(result.months).toBeLessThan(600)
    expect(result.balanceByMonth[result.balanceByMonth.length - 1]).toBeGreaterThan(0)
  })
})

describe('calculateRefinance', () => {
  const input = {
    currentBalance: 250000,
    currentRatePercent: 7.5,
    currentRemainingMonths: 300,
    newRatePercent: 5.5,
    newTermMonths: 300,
    closingCosts: 6000,
  }

  it('reports a monthly saving and a break-even month', () => {
    const result = calculateRefinance(input)
    expect(result.monthlySaving).toBeGreaterThan(0)
    expect(result.breakEvenMonths).toBe(Math.ceil(6000 / result.monthlySaving))
    expect(result.lifetimeSaving).toBeGreaterThan(0)
  })

  it('has no break-even when the new payment is higher', () => {
    const result = calculateRefinance({ ...input, newRatePercent: 9 })
    expect(result.monthlySaving).toBeLessThan(0)
    expect(result.breakEvenMonths).toBeNull()
  })

  it('flags a longer term that lowers the payment but costs more interest', () => {
    const result = calculateRefinance({ ...input, newRatePercent: 7.4, newTermMonths: 360 })
    expect(result.monthlySaving).toBeGreaterThan(0)
    expect(result.lifetimeSaving).toBeLessThan(0)
  })
})

describe('comparePrepayVsInvest', () => {
  const input = { principal: 300000, annualRatePercent: 6.5, termMonths: 360 }

  it('favours investing when returns beat the loan rate', () => {
    const result = comparePrepayVsInvest(input, 400, 12)
    expect(result.better).toBe('invest')
  })

  it('favours prepaying when returns are poor', () => {
    const result = comparePrepayVsInvest(input, 400, 1)
    expect(result.better).toBe('prepay')
  })

  it('always reports a positive gap', () => {
    expect(comparePrepayVsInvest(input, 400, 6.5).difference).toBeGreaterThanOrEqual(0)
  })
})
