import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NumberField } from './NumberField'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, calculateMonthlyPayment } from '../utils/loanMath'

const INITIAL = { principal: 20000, annualRatePercent: 8, termMonths: 48 }

/** A payment estimate right on the landing page — no need to pick a calculator just to get a number. */
export function QuickEstimate() {
  const [input, setInput] = useState(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol
  const navigate = useNavigate()

  const payment = calculateMonthlyPayment(input)
  const set = <K extends keyof typeof INITIAL>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const seeBreakdown = () => {
    const query = new URLSearchParams({
      amount: String(input.principal),
      rate: String(input.annualRatePercent),
      term: String(input.termMonths),
    })
    navigate(`/loan/personal?${query}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick estimate</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <NumberField label="Amount" prefix={symbol} value={input.principal} min={1} onChange={set('principal')} />
          <NumberField label="Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={100} onChange={set('annualRatePercent')} />
          <NumberField label="Term" suffix="months" value={input.termMonths} min={1} max={600} onChange={set('termMonths')} />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-300">
            Estimated payment: <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{money(payment)}</span>/mo
          </p>
          <button
            onClick={seeBreakdown}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            See full breakdown →
          </button>
        </div>
      </div>
    </div>
  )
}
