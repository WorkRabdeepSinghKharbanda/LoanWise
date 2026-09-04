import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AmortizationTable } from '../components/AmortizationTable'
import { BalanceChart } from '../components/charts/BalanceChart'
import { Term } from '../components/Term'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, formatMonths } from '../utils/loanMath'
import { calculateBalloonLoan } from '../utils/advancedMath'
import type { BalloonInput } from '../types/loan'

const INITIAL: BalloonInput = {
  principal: 250000,
  annualRatePercent: 6,
  termMonths: 120,
  interestOnlyMonths: 24,
  balloonAmount: 100000,
}

export function BalloonPage() {
  const [input, setInput] = useState<BalloonInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateBalloonLoan(input), [input])
  const set = <K extends keyof BalloonInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const extraInterest = result.totalInterest - result.vanillaTotalInterest

  return (
    <PageContainer>
      <Seo
        title="Interest-Only & Balloon Loan Calculator"
        description="Model an interest-only period and a balloon payment — see the lower monthly cost and the bill waiting at the end."
      />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🎈 Interest-Only & Balloon Loan</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Both structures cut the monthly payment by postponing principal. Nothing is free — you either refinance the{' '}
            <Term>balloon payment</Term> or pay it.
          </p>
        </div>

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
          <NumberField label="Loan Amount" prefix={symbol} value={input.principal} min={1} slider sliderMax={1000000} sliderStep={5000} onChange={set('principal')} />
          <NumberField label="Interest Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={50} slider sliderMax={20} sliderStep={0.05} onChange={set('annualRatePercent')} />
          <NumberField label="Term" suffix="months" value={input.termMonths} min={12} max={480} slider sliderMin={12} sliderMax={360} sliderStep={12} hint={formatMonths(input.termMonths)} onChange={set('termMonths')} />
          <NumberField
            label="Interest-Only Period"
            suffix="months"
            value={input.interestOnlyMonths}
            min={0}
            max={input.termMonths - 1}
            slider
            sliderMin={0}
            sliderMax={Math.max(1, input.termMonths - 1)}
            sliderStep={6}
            hint="No principal repaid during this time"
            onChange={set('interestOnlyMonths')}
          />
          <NumberField
            label="Balloon Due At End"
            prefix={symbol}
            value={input.balloonAmount}
            min={0}
            max={input.principal}
            slider
            sliderMin={0}
            sliderMax={input.principal}
            sliderStep={1000}
            hint="Principal deliberately left unpaid"
            onChange={set('balloonAmount')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Interest-Only Payment" value={money(result.interestOnlyPayment)} note={input.interestOnlyMonths > 0 ? `first ${formatMonths(input.interestOnlyMonths)}` : 'not used'} />
          <Tile label="Then Monthly Payment" value={money(result.amortizingPayment)} note="principal + interest" highlight />
          <Tile label="Balloon Due" value={money(result.balloonDue)} note={`at month ${input.termMonths}`} />
          <Tile label="Total Interest" value={money(result.totalInterest)} note="over the whole term" />
        </div>

        {result.balloonDue > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              You'll owe {money(result.balloonDue)} in one payment at month {input.termMonths}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              That's {((result.balloonDue / input.principal) * 100).toFixed(0)}% of what you borrowed, still
              outstanding. Most borrowers refinance or sell to cover it — if neither is possible, this structure is a
              trap.
            </p>
          </div>
        )}

        {extraInterest > 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Compared with a plain fully-amortizing loan on the same terms, this costs{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{money(extraInterest)}</span> more in
            interest — the price of keeping the monthly payment down.
          </p>
        )}

        <BalanceChart
          schedule={result.schedule}
          marker={
            input.interestOnlyMonths > 0
              ? { month: input.interestOnlyMonths, label: 'principal starts' }
              : null
          }
        />
        <AmortizationTable schedule={result.schedule} filename="balloon-loan-schedule.csv" />
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
