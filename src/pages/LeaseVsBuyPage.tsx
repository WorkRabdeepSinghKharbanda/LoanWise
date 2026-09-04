import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { Term } from '../components/Term'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import { calculateLeaseVsBuy } from '../utils/advancedMath'
import type { LeaseVsBuyInput } from '../types/loan'

const INITIAL: LeaseVsBuyInput = {
  vehiclePrice: 35000,
  months: 36,
  leaseMonthlyPayment: 450,
  leaseDownPayment: 2500,
  leaseEndFees: 400,
  buyDownPayment: 5000,
  buyRatePercent: 6.5,
  buyTermMonths: 60,
  residualValuePercent: 55,
}

export function LeaseVsBuyPage() {
  const [input, setInput] = useState<LeaseVsBuyInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateLeaseVsBuy(input), [input])
  const set = <K extends keyof LeaseVsBuyInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const buyWins = result.cheaper === 'buy'
  const barMax = Math.max(result.leaseTotalCost, result.buyNetCost, 1)

  return (
    <PageContainer>
      <Seo title="Lease vs Buy Calculator" description="Compare leasing a car against financing it, counting the equity you keep when you buy." />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Lease vs Buy"
          stats={[
            { label: 'Lease Total Cost', value: money(result.leaseTotalCost) },
            { label: 'Buy Net Cost', value: money(result.buyNetCost) },
            { label: 'Cheaper Option', value: buyWins ? 'Buy' : 'Lease' },
            { label: 'Difference', value: money(result.difference) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🚙 Lease vs Buy</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              A lease looks cheaper monthly because you're renting depreciation. Buying costs more up front but leaves
              you <Term>equity</Term> — this counts both.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="The car">
            <NumberField label="Vehicle Price" prefix={symbol} value={input.vehiclePrice} min={1} slider sliderMax={120000} sliderStep={500} onChange={set('vehiclePrice')} />
            <NumberField label="Comparison Period" suffix="months" value={input.months} min={12} max={120} slider sliderMin={12} sliderMax={84} sliderStep={6} onChange={set('months')} />
            <NumberField label="Value Left At The End" suffix="%" value={input.residualValuePercent} min={0} max={100} slider sliderMax={100} hint="Resale value as a share of price" onChange={set('residualValuePercent')} />
          </Card>

          <Card title="Lease">
            <NumberField label="Monthly Payment" prefix={symbol} value={input.leaseMonthlyPayment} min={0} slider sliderMax={2000} sliderStep={10} onChange={set('leaseMonthlyPayment')} />
            <NumberField label="Down Payment" prefix={symbol} value={input.leaseDownPayment} min={0} onChange={set('leaseDownPayment')} />
            <NumberField label="End-of-Lease Fees" prefix={symbol} value={input.leaseEndFees} min={0} hint="Disposition, wear and tear, mileage" onChange={set('leaseEndFees')} />
          </Card>

          <Card title="Buy">
            <NumberField label="Down Payment" prefix={symbol} value={input.buyDownPayment} min={0} max={input.vehiclePrice} onChange={set('buyDownPayment')} />
            <NumberField label="Finance Rate" suffix="% / yr" value={input.buyRatePercent} min={0} max={30} slider sliderMax={20} sliderStep={0.1} onChange={set('buyRatePercent')} />
            <NumberField label="Loan Term" suffix="months" value={input.buyTermMonths} min={12} max={120} slider sliderMin={12} sliderMax={96} sliderStep={6} onChange={set('buyTermMonths')} />
          </Card>
        </div>

        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            buyWins
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40'
          }`}
        >
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            Over {input.months} months, {buyWins ? 'buying' : 'leasing'} costs {money(result.difference)} less
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {buyWins
              ? `You'd spend ${money(result.buyCashSpent)} but keep ${money(result.buyEquity)} of equity, so the real cost is ${money(result.buyNetCost)} against the lease's ${money(result.leaseTotalCost)}.`
              : `Leasing costs ${money(result.leaseTotalCost)} outright, while buying nets out at ${money(result.buyNetCost)} after the ${money(result.buyEquity)} of equity you keep.`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Net cost side by side</h2>
          <div className="mt-5 flex flex-col gap-4">
            <Bar label="Lease" value={result.leaseTotalCost} max={barMax} winner={!buyWins} />
            <Bar label="Buy (after equity)" value={result.buyNetCost} max={barMax} winner={buyWins} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Lease total" value={money(result.leaseTotalCost)} />
          <Tile label="Buy — cash out" value={money(result.buyCashSpent)} />
          <Tile label="Buy — equity kept" value={money(result.buyEquity)} />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Want the full picture including fuel, insurance and depreciation?{' '}
          <Link to="/car-cost" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Try the car cost calculator →
          </Link>
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

function Bar({ label, value, max, winner }: { label: string; value: number; max: number; winner: boolean }) {
  const { money } = useFormat()
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{money(value)}</span>
      </div>
      <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${winner ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          style={{ width: `${Math.max(2, (Math.max(0, value) / max) * 100)}%` }}
        />
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
