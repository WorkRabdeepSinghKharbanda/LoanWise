import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { CostBreakdownBar } from '../components/charts/CostBreakdownBar'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import { calculateCarCost } from '../utils/advancedMath'
import type { CarCostInput } from '../types/loan'

const INITIAL: CarCostInput = {
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

export function CarCostPage() {
  const [input, setInput] = useState<CarCostInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateCarCost(input), [input])
  const set = <K extends keyof CarCostInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const segments = [
    { label: 'Depreciation', value: result.depreciation },
    { label: 'Fuel', value: result.fuel },
    { label: 'Insurance', value: result.insurance },
    { label: 'Loan interest', value: result.loanInterest },
    { label: 'Maintenance', value: result.maintenance },
    { label: 'Registration', value: result.registration },
  ]
  const biggest = [...segments].sort((a, b) => b.value - a.value)[0]

  return (
    <PageContainer>
      <Seo
        title="Car Cost Calculator"
        description="The true cost of owning a car — depreciation, fuel, insurance, maintenance and loan interest, per month."
      />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="True Cost of Ownership"
          stats={[
            { label: 'Total Cost', value: money(result.totalCost) },
            { label: 'Cost Per Month', value: money(result.costPerMonth) },
            { label: 'Biggest Cost', value: biggest.label },
            { label: 'Resale Value', value: money(result.resaleValue) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🚗 True Cost of Ownership</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              The monthly payment is only part of what a car costs. Depreciation is usually the biggest line and never
              appears on a finance quote.
            </p>
          </div>
          <div className="no-print flex gap-2">
            <button
              onClick={() => setInput(INITIAL)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
            <PrintButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="The purchase">
            <NumberField label="Vehicle Price" prefix={symbol} value={input.vehiclePrice} min={1} slider sliderMax={150000} sliderStep={500} onChange={set('vehiclePrice')} />
            <NumberField label="Down Payment" prefix={symbol} value={input.downPayment} min={0} max={input.vehiclePrice} onChange={set('downPayment')} />
            <NumberField label="Finance Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={30} slider sliderMax={20} sliderStep={0.1} onChange={set('annualRatePercent')} />
            <NumberField label="Loan Term" suffix="months" value={input.termMonths} min={12} max={120} slider sliderMin={12} sliderMax={96} sliderStep={6} onChange={set('termMonths')} />
            <NumberField label="Years You'll Keep It" suffix="years" value={input.yearsOwned} min={1} max={25} slider sliderMin={1} sliderMax={15} onChange={set('yearsOwned')} />
          </Card>

          <Card title="Running costs">
            <NumberField label="Fuel / Charging" prefix={symbol} suffix="/ mo" value={input.monthlyFuel} min={0} slider sliderMax={600} sliderStep={10} onChange={set('monthlyFuel')} />
            <NumberField label="Insurance" prefix={symbol} suffix="/ yr" value={input.annualInsurance} min={0} slider sliderMax={6000} sliderStep={50} onChange={set('annualInsurance')} />
            <NumberField label="Maintenance & Tyres" prefix={symbol} suffix="/ yr" value={input.annualMaintenance} min={0} slider sliderMax={5000} sliderStep={50} onChange={set('annualMaintenance')} />
            <NumberField label="Tax / Registration" prefix={symbol} suffix="/ yr" value={input.annualRegistration} min={0} onChange={set('annualRegistration')} />
            <NumberField label="Depreciation" suffix="% / yr" value={input.annualDepreciationPercent} min={0} max={50} slider sliderMax={35} sliderStep={0.5} hint="New cars typically lose 15–20% a year" onChange={set('annualDepreciationPercent')} />
          </Card>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 text-center shadow-sm dark:border-indigo-800 dark:from-indigo-950/60 dark:to-slate-900">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Real cost over {input.yearsOwned} years</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{money(result.totalCost)}</p>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            That's <span className="font-semibold text-slate-800 dark:text-slate-200">{money(result.costPerMonth)}</span> a
            month, all in — and the car is worth {money(result.resaleValue)} at the end.
          </p>
        </div>

        <CostBreakdownBar segments={segments} total={result.totalCost} />

        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Your biggest cost is <span className="font-semibold text-slate-900 dark:text-white">{biggest.label.toLowerCase()}</span> at{' '}
          {money(biggest.value)} — {((biggest.value / Math.max(1, result.totalCost)) * 100).toFixed(0)}% of the total.
          {biggest.label === 'Depreciation' && ' Buying a two- or three-year-old car avoids most of it.'}
        </p>
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
