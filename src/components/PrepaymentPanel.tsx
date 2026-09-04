import { useState } from 'react'
import { NumberField } from './NumberField'
import { useFormat, useSettings } from '../context/SettingsContext'
import {
  CURRENCIES,
  biweeklyExtraEquivalent,
  calculateMonthlyPayment,
  comparePrepayVsInvest,
  extraForTargetMonths,
  formatMonths,
} from '../utils/loanMath'
import type { LoanInput, LoanResult } from '../types/loan'

interface Props {
  input: LoanInput
  onChange: (input: LoanInput) => void
  result: LoanResult
}

/** Everything about paying the loan off faster, in one place. */
export function PrepaymentPanel({ input, onChange, result }: Props) {
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const [targetMonths, setTargetMonths] = useState(Math.max(6, Math.round(input.termMonths * 0.75)))
  const [returnPercent, setReturnPercent] = useState(7)

  // The term can shrink under a target the user already picked; clamp on render
  // rather than holding a value that's now longer than the loan itself.
  const target = Math.min(Math.max(1, targetMonths), Math.max(1, input.termMonths - 1))
  // Same for a lump-sum month carried over from a longer term.
  const lumpMonth = Math.min(input.lumpSumMonth ?? 12, input.termMonths)

  const scheduled = calculateMonthlyPayment(input)
  const biweeklyExtra = biweeklyExtraEquivalent(scheduled)
  const biweeklyOn = Math.abs((input.extraMonthlyPayment ?? 0) - biweeklyExtra) < 0.01
  const extra = input.extraMonthlyPayment ?? 0

  const goalExtra = extraForTargetMonths(input, target)
  const investComparison = extra > 0 ? comparePrepayVsInvest(input, extra, returnPercent) : null

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">Pay it off faster</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Extra money goes straight to principal, so every bit of it removes future interest.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField
          label="Extra Monthly"
          prefix={symbol}
          value={extra}
          min={0}
          slider
          sliderMin={0}
          sliderMax={Math.max(500, Math.round(scheduled))}
          sliderStep={10}
          onChange={(extraMonthlyPayment) => onChange({ ...input, extraMonthlyPayment })}
        />
        <NumberField
          label="One-Off Lump Sum"
          prefix={symbol}
          value={input.lumpSumAmount ?? 0}
          min={0}
          onChange={(lumpSumAmount) => onChange({ ...input, lumpSumAmount, lumpSumMonth: input.lumpSumMonth || 12 })}
        />
        <NumberField
          label="Lump Sum Paid At Month"
          value={lumpMonth}
          min={1}
          max={input.termMonths}
          slider
          sliderMin={1}
          sliderMax={input.termMonths}
          hint="Earlier saves more"
          onChange={(lumpSumMonth) => onChange({ ...input, lumpSumMonth })}
        />
        <NumberField
          label="Annual Bonus Payment"
          prefix={symbol}
          value={input.annualExtraPayment ?? 0}
          min={0}
          hint="Paid once every 12 months"
          onChange={(annualExtraPayment) => onChange({ ...input, annualExtraPayment })}
        />
      </div>

      {/* Biweekly trick */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Pay half every two weeks</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            26 half-payments a year is one extra payment — about {money(biweeklyExtra)}/mo.
          </p>
        </div>
        <button
          onClick={() => onChange({ ...input, extraMonthlyPayment: biweeklyOn ? 0 : biweeklyExtra })}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            biweeklyOn
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border border-slate-300 text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {biweeklyOn ? '✓ Applied' : 'Apply biweekly'}
        </button>
      </div>

      {/* Payoff goal solver */}
      <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Work backwards from a payoff date</p>
        <div className="mt-3 grid items-end gap-5 sm:grid-cols-2">
          <NumberField
            label="I want to be debt-free in"
            suffix="months"
            value={target}
            min={1}
            max={input.termMonths}
            slider
            sliderMin={1}
            sliderMax={Math.max(1, input.termMonths - 1)}
            sliderStep={1}
            hint={formatMonths(target)}
            onChange={setTargetMonths}
          />
          <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/50">
            {goalExtra > 0 ? (
              <>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">Add this much every month</p>
                <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{money(goalExtra)}</p>
                <button
                  onClick={() => onChange({ ...input, extraMonthlyPayment: goalExtra })}
                  className="mt-2 text-xs font-semibold text-indigo-700 underline dark:text-indigo-300"
                >
                  Apply it
                </button>
              </>
            ) : (
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                That's the full term already — nothing extra needed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Prepay vs invest */}
      {investComparison && (
        <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Or invest that money instead?</p>
          <div className="mt-3 grid items-end gap-5 sm:grid-cols-2">
            <NumberField
              label="Expected annual return"
              suffix="% / yr"
              value={returnPercent}
              min={0}
              max={30}
              slider
              sliderMin={0}
              sliderMax={15}
              sliderStep={0.5}
              hint="Long-run stock market averages sit near 7% real"
              onChange={setReturnPercent}
            />
            <div
              className={`rounded-xl p-4 ${
                investComparison.better === 'prepay'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40'
                  : 'bg-amber-50 dark:bg-amber-950/40'
              }`}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {investComparison.better === 'prepay' ? 'Prepaying wins' : 'Investing wins'} by{' '}
                {money(investComparison.difference)}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Interest saved {money(investComparison.interestSaved)} vs investment gain{' '}
                {money(investComparison.investmentValue - investComparison.investedContributions)}. Prepaying is
                guaranteed; the return isn't.
              </p>
            </div>
          </div>
        </div>
      )}

      {result.interestSaved > 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Current plan clears the loan in <span className="font-semibold text-slate-800 dark:text-slate-200">{formatMonths(result.payoffMonths)}</span>{' '}
          — {formatMonths(result.monthsSaved)} early, saving{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{money(result.interestSaved)}</span>.
        </p>
      )}
    </div>
  )
}
