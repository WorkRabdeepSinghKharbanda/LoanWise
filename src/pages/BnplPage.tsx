import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import { calculateBnplVsLoan } from '../utils/advancedMath'
import type { BnplInput } from '../types/loan'

const INITIAL: BnplInput = {
  purchaseAmount: 1200,
  installments: 4,
  planFee: 0,
  loanRatePercent: 22,
  loanTermMonths: 12,
  lateRiskPercent: 15,
  lateFee: 35,
}

export function BnplPage() {
  const [input, setInput] = useState<BnplInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateBnplVsLoan(input), [input])
  const set = <K extends keyof BnplInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const bnplWins = result.cheaper === 'bnpl'

  return (
    <PageContainer>
      <Seo
        title="Buy Now, Pay Later vs Loan Calculator"
        description="Compare a Buy Now Pay Later plan against financing the same purchase, including the real cost of a missed payment."
      />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Buy Now, Pay Later vs Loan"
          stats={[
            { label: 'BNPL Expected Total', value: money(result.bnplExpectedTotal) },
            { label: 'Loan Total', value: money(result.loanTotal) },
            { label: 'Cheaper Option', value: bnplWins ? 'BNPL' : 'Loan' },
            { label: 'Difference', value: money(result.difference) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🛍️ Buy Now, Pay Later vs Loan</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              "0% interest" only stays 0% if every payment lands on time. This counts the plan fee and the real chance
              of a late fee against just financing the purchase.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="The purchase">
            <NumberField label="Purchase Amount" prefix={symbol} value={input.purchaseAmount} min={1} slider sliderMax={10000} sliderStep={50} onChange={set('purchaseAmount')} />
            <NumberField label="BNPL Installments" value={input.installments} min={1} max={24} slider sliderMin={1} sliderMax={12} hint="4 = classic Pay-in-4" onChange={set('installments')} />
            <NumberField label="Plan Fee" prefix={symbol} value={input.planFee} min={0} hint="Some plans charge this up front" onChange={set('planFee')} />
          </Card>

          <Card title="Risk & the alternative">
            <NumberField label="Chance of Missing a Payment" suffix="%" value={input.lateRiskPercent} min={0} max={100} slider sliderMax={100} hint="Be honest — most people underestimate this" onChange={set('lateRiskPercent')} />
            <NumberField label="Late Fee" prefix={symbol} value={input.lateFee} min={0} onChange={set('lateFee')} />
            <NumberField label="Loan/Card Rate Instead" suffix="% / yr" value={input.loanRatePercent} min={0} max={40} slider sliderMax={30} sliderStep={0.5} onChange={set('loanRatePercent')} />
            <NumberField label="Loan Term" suffix="months" value={input.loanTermMonths} min={1} max={60} slider sliderMin={1} sliderMax={36} onChange={set('loanTermMonths')} />
          </Card>
        </div>

        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            bnplWins
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
          }`}
        >
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {bnplWins ? 'BNPL' : 'Financing it instead'} costs {money(result.difference)} less
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Expected BNPL cost {money(result.bnplExpectedTotal)} (including a {input.lateRiskPercent}% chance of one late fee) vs{' '}
            {money(result.loanTotal)} financed at {input.loanRatePercent}%.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="BNPL Payment" value={money(result.bnplMonthly)} note={`× ${input.installments}`} highlight={bnplWins} />
          <Tile label="BNPL Total (on time)" value={money(result.bnplTotal)} note="if nothing is missed" />
          <Tile label="BNPL Expected Total" value={money(result.bnplExpectedTotal)} note="counting late-fee risk" />
          <Tile label="Loan Payment" value={money(result.loanMonthly)} note={`× ${input.loanTermMonths}`} highlight={!bnplWins} />
        </div>
      </div>
    </PageContainer>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
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
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{note}</p>
    </div>
  )
}
