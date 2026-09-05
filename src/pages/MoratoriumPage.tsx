import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AmortizationTable } from '../components/AmortizationTable'
import { PrintReport } from '../components/PrintReport'
import { BalanceChart } from '../components/charts/BalanceChart'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, formatMonths } from '../utils/loanMath'
import { calculateMoratorium } from '../utils/advancedMath'
import type { MoratoriumInput } from '../types/loan'

const INITIAL: MoratoriumInput = {
  principal: 300000,
  annualRatePercent: 6.5,
  termMonths: 120,
  moratoriumMonths: 6,
}

export function MoratoriumPage() {
  const [input, setInput] = useState<MoratoriumInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateMoratorium(input), [input])
  const set = <K extends keyof MoratoriumInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const extraInterest = result.totalInterest - result.noMoratoriumTotalInterest

  return (
    <PageContainer>
      <Seo
        title="EMI Holiday / Moratorium Calculator"
        description="See the real cost of a payment holiday — the capitalized interest, the higher EMI afterward, and the total extra interest it adds."
      />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="EMI Holiday / Moratorium"
          stats={[
            { label: 'Original EMI', value: money(result.originalMonthlyPayment) },
            { label: 'EMI After Holiday', value: money(result.revisedMonthlyPayment) },
            { label: 'Capitalized Interest', value: money(result.capitalizedInterest) },
            { label: 'Extra Interest Total', value: money(extraInterest) },
          ]}
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">⏸️ EMI Holiday / Moratorium</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Skipping payments doesn't skip interest — it keeps accruing and gets added to what you owe, so the EMI that
            resumes afterward is higher than if you'd never paused.
          </p>
        </div>

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="no-print col-span-full flex justify-end">
            <button
              onClick={() => setInput(INITIAL)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
          </div>
          <NumberField label="Loan Amount" prefix={symbol} value={input.principal} min={1} slider sliderMax={1000000} sliderStep={5000} onChange={set('principal')} />
          <NumberField label="Interest Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={40} slider sliderMax={20} sliderStep={0.05} onChange={set('annualRatePercent')} />
          <NumberField label="Term" suffix="months" value={input.termMonths} min={6} max={480} slider sliderMin={12} sliderMax={360} sliderStep={12} hint={formatMonths(input.termMonths)} onChange={set('termMonths')} />
          <NumberField
            label="Holiday Length"
            suffix="months"
            value={input.moratoriumMonths}
            min={0}
            max={36}
            slider
            sliderMin={0}
            sliderMax={24}
            hint="No payment made during this time"
            onChange={set('moratoriumMonths')}
          />
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {input.moratoriumMonths} months off costs {money(extraInterest)} in extra interest
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Your balance grows to {money(result.balanceAfterMoratorium)} during the holiday ({money(result.capitalizedInterest)} of
            capitalized interest), and the loan now finishes {formatMonths(input.moratoriumMonths)} later than planned.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Original EMI" value={money(result.originalMonthlyPayment)} />
          <Tile label="EMI After Holiday" value={money(result.revisedMonthlyPayment)} highlight />
          <Tile label="Balance After Holiday" value={money(result.balanceAfterMoratorium)} />
          <Tile label="Loan Finishes" value={`${formatMonths(input.termMonths + input.moratoriumMonths)}`} note="from today" />
        </div>

        <BalanceChart schedule={result.schedule} marker={input.moratoriumMonths > 0 ? { month: input.moratoriumMonths, label: 'EMI resumes' } : null} />
        <AmortizationTable schedule={result.schedule} filename="moratorium-schedule.csv" />
      </div>
    </PageContainer>
  )
}

function Tile({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
    </div>
  )
}
