import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AmortizationTable } from '../components/AmortizationTable'
import { TwoSeriesChart } from '../components/charts/TwoSeriesChart'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, buildAmortizationSchedule, calculateLoan, formatMonths } from '../utils/loanMath'
import { calculateArm } from '../utils/advancedMath'
import type { ArmInput } from '../types/loan'

const INITIAL: ArmInput = {
  principal: 350000,
  initialRatePercent: 5.25,
  fixedMonths: 60,
  resetRatePercent: 8,
  termMonths: 360,
  periodicCapPercent: 2,
}

export function ArmPage() {
  const [input, setInput] = useState<ArmInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateArm(input), [input])
  const set = <K extends keyof ArmInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  // The honest comparison: a fixed-rate loan at the reset rate for the whole term.
  const fixed = useMemo(
    () =>
      calculateLoan({
        principal: input.principal,
        annualRatePercent: result.cappedResetRate,
        termMonths: input.termMonths,
      }),
    [input.principal, input.termMonths, result.cappedResetRate],
  )

  const armBalances = result.schedule.map((row) => row.balance)
  const fixedBalances = buildAmortizationSchedule({
    principal: input.principal,
    annualRatePercent: result.cappedResetRate,
    termMonths: input.termMonths,
  }).map((row) => row.balance)

  const capped = result.cappedResetRate !== input.resetRatePercent
  const shockUp = result.paymentShock > 0

  return (
    <PageContainer>
      <Seo
        title="ARM Payment Shock Calculator"
        description="Model an adjustable-rate mortgage: the teaser payment, the capped reset, and exactly how much the payment jumps."
      />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📉 Adjustable Rate (ARM) Stress Test</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            A low fixed period, then the rate resets and the payment is recast over what's left of the term. The question
            that matters is whether you can afford the payment after the reset.
          </p>
        </div>

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
          <NumberField label="Loan Amount" prefix={symbol} value={input.principal} min={1} slider sliderMax={1500000} sliderStep={5000} onChange={set('principal')} />
          <NumberField label="Starting Rate" suffix="% / yr" value={input.initialRatePercent} min={0} max={30} slider sliderMax={15} sliderStep={0.05} onChange={set('initialRatePercent')} />
          <NumberField label="Fixed For" suffix="months" value={input.fixedMonths} min={1} max={input.termMonths - 1} slider sliderMin={12} sliderMax={Math.max(12, input.termMonths - 12)} sliderStep={12} hint={formatMonths(input.fixedMonths)} onChange={set('fixedMonths')} />
          <NumberField label="Rate After Reset" suffix="% / yr" value={input.resetRatePercent} min={0} max={30} slider sliderMax={15} sliderStep={0.05} hint="Your stress-test assumption" onChange={set('resetRatePercent')} />
          <NumberField label="Adjustment Cap" suffix="%" value={input.periodicCapPercent} min={0} max={10} slider sliderMax={6} sliderStep={0.5} hint="Most the rate can move at reset" onChange={set('periodicCapPercent')} />
          <NumberField label="Total Term" suffix="months" value={input.termMonths} min={24} max={480} slider sliderMin={24} sliderMax={360} sliderStep={12} hint={formatMonths(input.termMonths)} onChange={set('termMonths')} />
        </div>

        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            shockUp
              ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
          }`}
        >
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {shockUp
              ? `Your payment jumps ${money(result.paymentShock)} (${result.paymentShockPercent.toFixed(1)}%) at month ${input.fixedMonths + 1}`
              : `Your payment falls ${money(Math.abs(result.paymentShock))} at month ${input.fixedMonths + 1}`}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {money(result.initialPayment)} → {money(result.resetPayment)} at {result.cappedResetRate.toFixed(2)}%.
            {capped && ` The ${input.periodicCapPercent}% cap held the rate below your ${input.resetRatePercent}% assumption.`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Payment (fixed period)" value={money(result.initialPayment)} note={formatMonths(input.fixedMonths)} highlight />
          <Tile label="Payment (after reset)" value={money(result.resetPayment)} note={`at ${result.cappedResetRate.toFixed(2)}%`} />
          <Tile label="ARM total interest" value={money(result.totalInterest)} note="over the full term" />
          <Tile
            label="Fixed-rate alternative"
            value={money(fixed.totalInterest)}
            note={`if you'd fixed at ${result.cappedResetRate.toFixed(2)}%`}
          />
        </div>

        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {result.totalInterest < fixed.totalInterest ? (
            <>
              The ARM saves {money(fixed.totalInterest - result.totalInterest)} in interest against fixing at{' '}
              {result.cappedResetRate.toFixed(2)}% — the teaser period is doing that work. It only holds if rates land
              where you assumed.
            </>
          ) : (
            <>
              The ARM costs {money(result.totalInterest - fixed.totalInterest)} more than simply fixing at{' '}
              {result.cappedResetRate.toFixed(2)}% for the whole term.
            </>
          )}
        </p>

        <TwoSeriesChart
          title="Balance: ARM vs fixed-rate alternative"
          seriesA={{ label: 'ARM', values: armBalances }}
          seriesB={{ label: `Fixed at ${result.cappedResetRate.toFixed(2)}%`, values: fixedBalances }}
          marker={{ index: input.fixedMonths, label: 'rate resets' }}
        />

        <AmortizationTable schedule={result.schedule} filename="arm-schedule.csv" />
      </div>
    </PageContainer>
  )
}

function Tile({ label, value, note, highlight }: { label: string; value: string; note: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{note}</p>
    </div>
  )
}
