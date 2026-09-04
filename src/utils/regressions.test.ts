import { describe, expect, it } from 'vitest'
import { buildAmortizationSchedule, calculateLoan, calculateStepUpLoan } from './loanMath'
import { calculateApr, calculateCreditCardPayoff, calculateStudentLoan } from './advancedMath'

/**
 * One test per bug found in review. Each fails against the old behaviour.
 */

describe('lump sum with no month set', () => {
  it('defaults to month 12, not month 1', () => {
    const schedule = buildAmortizationSchedule({
      principal: 100000,
      annualRatePercent: 6,
      termMonths: 120,
      lumpSumAmount: 10000,
    })

    // Month 1 must look like an ordinary payment; the lump lands in month 12.
    expect(schedule[0].principalPaid).toBeLessThan(1000)
    expect(schedule[11].principalPaid).toBeGreaterThan(10000)
  })
})

describe('step-up EMI with a degenerate loan', () => {
  it('reports zero rather than converging on the bisection seed', () => {
    const zeroPrincipal = calculateStepUpLoan({
      principal: 0,
      annualRatePercent: 8,
      termMonths: 120,
      annualStepUpPercent: 5,
    })
    expect(zeroPrincipal.monthlyPayment).toBe(0)
    expect(zeroPrincipal.schedule).toHaveLength(0)

    const zeroTerm = calculateStepUpLoan({
      principal: 10000,
      annualRatePercent: 8,
      termMonths: 0,
      annualStepUpPercent: 5,
    })
    expect(zeroTerm.monthlyPayment).toBe(0)
  })
})

describe('APR when fees swallow the advance', () => {
  it('flags the case instead of quoting the nominal rate as the APR', () => {
    const result = calculateApr(
      { principal: 2000, annualRatePercent: 10, termMonths: 24 },
      { originationFee: 2500, points: 0, otherFees: 0 },
    )
    expect(result.feesExceedPrincipal).toBe(true)
    expect(result.totalFees).toBe(2500)
  })

  it('stays false for ordinary fees, where the APR is real', () => {
    const result = calculateApr(
      { principal: 300000, annualRatePercent: 6.5, termMonths: 360 },
      { originationFee: 3000, points: 1, otherFees: 1200 },
    )
    expect(result.feesExceedPrincipal).toBe(false)
    expect(result.aprPercent).toBeGreaterThan(6.5)
  })
})

describe('credit card comparison when the minimum never clears', () => {
  it('reports no saving figure rather than a negative one', () => {
    const result = calculateCreditCardPayoff({
      balance: 6000,
      aprPercent: 22.9,
      minimumPercent: 1,
      minimumFloor: 0,
      fixedPayment: 300,
    })

    expect(result.minimumOnly.neverPaysOff).toBe(true)
    expect(result.interestSaved).toBeNull()
    expect(result.monthsSaved).toBeNull()
  })

  it('still reports a positive saving when both plans clear', () => {
    const result = calculateCreditCardPayoff({
      balance: 6000,
      aprPercent: 22.9,
      // 4% of the balance outruns the interest by enough to actually clear.
      minimumPercent: 4,
      minimumFloor: 25,
      fixedPayment: 300,
    })

    expect(result.minimumOnly.neverPaysOff).toBe(false)
    expect(result.interestSaved).toBeGreaterThan(0)
    expect(result.monthsSaved).toBeGreaterThan(0)
  })
})

describe('income-driven repayment totals', () => {
  it('never counts more paid than was actually owed', () => {
    const result = calculateStudentLoan({
      balance: 60000,
      annualRatePercent: 6,
      standardTermMonths: 120,
      annualIncome: 200000,
      povertyLine: 15650,
      discretionaryPercent: 20,
      annualIncomeGrowthPercent: 3,
      forgivenessMonths: 240,
    })

    const { totalPaid, totalInterest, forgivenAmount } = result.incomeDriven
    expect(forgivenAmount).toBe(0)
    // Paying off in full means principal + interest, never more.
    expect(totalPaid).toBeLessThanOrEqual(60000 + totalInterest + 0.01)
    expect(totalPaid).toBeGreaterThan(60000)
  })
})

describe('monthly payment display inputs', () => {
  it('keeps the level payment separate from a month-1 lump sum', () => {
    const result = calculateLoan({
      principal: 300000,
      annualRatePercent: 6,
      termMonths: 360,
      lumpSumAmount: 50000,
      lumpSumMonth: 1,
    })

    // The scheduled payment must stay the level payment — the UI adds only the
    // recurring extra to it, so a huge first row can't inflate the headline.
    expect(result.monthlyPayment).toBeCloseTo(1798.65, 1)
    expect(result.schedule[0].payment).toBeGreaterThan(50000)
  })

  it('closes a 0% loan immediately when the extra exceeds the balance', () => {
    const result = calculateLoan({
      principal: 100,
      annualRatePercent: 0,
      termMonths: 12,
      extraMonthlyPayment: 1000,
    })

    expect(result.payoffMonths).toBe(1)
    // Total paid is the balance, which is what the UI clamps the monthly tile to.
    expect(result.totalPayment).toBeCloseTo(100, 2)
    expect(result.monthlyPayment).toBeCloseTo(100 / 12, 2)
  })
})

describe('annual bonus payment', () => {
  it('is honoured alongside a monthly extra and a lump sum', () => {
    const base = { principal: 200000, annualRatePercent: 6, termMonths: 240 }
    const plain = calculateLoan(base)
    const all = calculateLoan({
      ...base,
      extraMonthlyPayment: 100,
      annualExtraPayment: 2000,
      lumpSumAmount: 5000,
      lumpSumMonth: 24,
    })

    expect(all.payoffMonths).toBeLessThan(plain.payoffMonths)
    expect(all.interestSaved).toBeGreaterThan(0)
  })

  it('counts on its own, with no monthly extra', () => {
    const base = { principal: 200000, annualRatePercent: 6, termMonths: 240 }
    const bonusOnly = calculateLoan({ ...base, annualExtraPayment: 3000 })
    expect(bonusOnly.interestSaved).toBeGreaterThan(0)
    expect(bonusOnly.monthsSaved).toBeGreaterThan(0)
  })
})

describe('short-term loans', () => {
  it('handles a one-month loan without producing junk', () => {
    const result = calculateLoan({ principal: 1000, annualRatePercent: 12, termMonths: 1 })
    expect(result.schedule).toHaveLength(1)
    expect(result.schedule[0].balance).toBe(0)
    expect(result.totalInterest).toBeCloseTo(10, 2)
    expect(Number.isFinite(result.monthlyPayment)).toBe(true)
  })
})
