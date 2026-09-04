import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { calculateLoan } from '../utils/loanMath'
import type { LoanInput } from '../types/loan'

const KEYS: Record<keyof LoanInput, string> = {
  principal: 'amount',
  annualRatePercent: 'rate',
  termMonths: 'term',
  extraMonthlyPayment: 'extra',
  lumpSumAmount: 'lump',
  lumpSumMonth: 'lumpAt',
  annualExtraPayment: 'bonus',
}

/**
 * Loan input state backed by the URL query string, so any calculator view is
 * a shareable link. Falls back to `initial` for params that aren't present.
 */
export function useLoanCalculator(initial: LoanInput) {
  const [params, setParams] = useSearchParams()

  const input = useMemo<LoanInput>(() => {
    const read = (key: string, fallback: number) => {
      const raw = params.get(key)
      const n = raw === null ? NaN : Number(raw)
      return Number.isFinite(n) && n >= 0 ? n : fallback
    }
    return {
      principal: read(KEYS.principal, initial.principal),
      annualRatePercent: read(KEYS.annualRatePercent, initial.annualRatePercent),
      termMonths: Math.max(1, read(KEYS.termMonths, initial.termMonths)),
      extraMonthlyPayment: read(KEYS.extraMonthlyPayment, initial.extraMonthlyPayment ?? 0),
      lumpSumAmount: read(KEYS.lumpSumAmount, initial.lumpSumAmount ?? 0),
      lumpSumMonth: Math.max(1, read(KEYS.lumpSumMonth, initial.lumpSumMonth ?? 12)),
      annualExtraPayment: read(KEYS.annualExtraPayment, initial.annualExtraPayment ?? 0),
    }
  }, [params, initial])

  const setInput = useCallback(
    (next: LoanInput) => {
      const query = new URLSearchParams()
      query.set(KEYS.principal, String(next.principal))
      query.set(KEYS.annualRatePercent, String(next.annualRatePercent))
      query.set(KEYS.termMonths, String(next.termMonths))
      if (next.extraMonthlyPayment) query.set(KEYS.extraMonthlyPayment, String(next.extraMonthlyPayment))
      if (next.lumpSumAmount) {
        query.set(KEYS.lumpSumAmount, String(next.lumpSumAmount))
        query.set(KEYS.lumpSumMonth, String(next.lumpSumMonth ?? 12))
      }
      if (next.annualExtraPayment) query.set(KEYS.annualExtraPayment, String(next.annualExtraPayment))
      setParams(query, { replace: true })
    },
    [setParams],
  )

  const result = useMemo(() => calculateLoan(input), [input])

  return { input, setInput, result }
}
