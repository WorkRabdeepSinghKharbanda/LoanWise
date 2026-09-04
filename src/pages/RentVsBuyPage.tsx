import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { RentVsBuyChart } from '../components/charts/RentVsBuyChart'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, calculateRentVsBuy } from '../utils/loanMath'
import type { RentVsBuyInput } from '../types/loan'

const INITIAL: RentVsBuyInput = {
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

export function RentVsBuyPage() {
  const [input, setInput] = useState<RentVsBuyInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateRentVsBuy(input), [input])
  const set = <K extends keyof RentVsBuyInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })
  const buyingWins = result.buyTotal < result.rentTotal

  return (
    <PageContainer>
      <Seo title="Rent vs Buy Calculator" description="Compare the true cost of renting against buying over time, including equity, appreciation, tax and insurance." />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Rent vs Buy"
          stats={[
            { label: 'Total Rent Cost', value: money(result.rentTotal) },
            { label: 'Net Buy Cost', value: money(result.buyTotal) },
            { label: 'Cheaper Option', value: buyingWins ? 'Buy' : 'Rent' },
            { label: 'Break-Even Year', value: result.breakEvenYear ? `Year ${result.breakEvenYear}` : 'None' },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🏘️ Rent vs Buy</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Renting isn't just "throwing money away" and buying isn't automatically cheaper — it depends on how long
              you stay.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
          <NumberField label="Home Price" prefix={symbol} value={input.homePrice} min={1} onChange={set('homePrice')} />
          <NumberField label="Down Payment" prefix={symbol} value={input.downPayment} min={0} max={input.homePrice} onChange={set('downPayment')} />
          <NumberField label="Mortgage Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={100} onChange={set('annualRatePercent')} />
          <NumberField label="Mortgage Term" suffix="months" value={input.termMonths} min={1} max={600} onChange={set('termMonths')} />
          <NumberField label="Monthly Rent" prefix={symbol} value={input.monthlyRent} min={0} onChange={set('monthlyRent')} />
          <NumberField label="Rent Growth" suffix="% / yr" value={input.annualRentGrowthPercent} min={0} max={30} onChange={set('annualRentGrowthPercent')} />
          <NumberField label="Home Appreciation" suffix="% / yr" value={input.annualAppreciationPercent} min={0} max={30} onChange={set('annualAppreciationPercent')} />
          <NumberField label="Tax + Insurance" suffix="% / yr" value={input.annualTaxInsurancePercent} min={0} max={10} hint="Of home price, per year" onChange={set('annualTaxInsurancePercent')} />
          <NumberField label="Years You'll Stay" suffix="years" value={input.yearsToStay} min={1} max={40} onChange={set('yearsToStay')} />
        </div>

        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            buyingWins
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40'
          }`}
        >
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            Over {input.yearsToStay} years, {buyingWins ? 'buying' : 'renting'} costs less — by{' '}
            {money(Math.abs(result.rentTotal - result.buyTotal))}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {result.breakEvenYear
              ? `Buying pulls ahead of renting in year ${result.breakEvenYear}. Sell before then and renting was the better deal.`
              : `Buying never overtakes renting inside ${input.yearsToStay} years at these numbers.`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Tile label={`Total cost of renting (${input.yearsToStay} yr)`} value={money(result.rentTotal)} />
          <Tile label={`Net cost of buying (${input.yearsToStay} yr)`} value={money(result.buyTotal)} note="After recovering equity at sale" />
        </div>

        <RentVsBuyChart years={result.years} breakEvenYear={result.breakEvenYear} />
      </div>
    </PageContainer>
  )
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
    </div>
  )
}
