import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { TwoSeriesChart } from '../components/charts/TwoSeriesChart'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, formatMonths } from '../utils/loanMath'
import { calculateCreditCardPayoff } from '../utils/advancedMath'
import type { CreditCardInput } from '../types/loan'

const INITIAL: CreditCardInput = {
  balance: 6000,
  aprPercent: 22.9,
  minimumPercent: 2,
  minimumFloor: 25,
  fixedPayment: 300,
}

export function CreditCardPage() {
  const [input, setInput] = useState<CreditCardInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateCreditCardPayoff(input), [input])
  const set = <K extends keyof CreditCardInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const { minimumOnly, fixed } = result

  return (
    <PageContainer>
      <Seo
        title="Credit Card Payoff Calculator"
        description="See how long minimum payments really take, and how much a fixed monthly payment saves you."
      />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Credit Card Payoff"
          stats={[
            { label: 'Fixed Payment Interest', value: money(fixed.totalInterest) },
            { label: 'Minimum-Only Interest', value: minimumOnly.neverPaysOff ? 'Never clears' : money(minimumOnly.totalInterest) },
            { label: 'Time on Fixed Payment', value: formatMonths(fixed.months) },
            { label: 'Interest Saved', value: result.interestSaved === null ? '—' : money(result.interestSaved) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">💳 Credit Card Payoff</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Minimum payments shrink as the balance does — which is exactly why they take decades. Compare against
              paying a fixed amount.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
          <NumberField label="Card Balance" prefix={symbol} value={input.balance} min={1} slider sliderMax={30000} sliderStep={100} onChange={set('balance')} />
          <NumberField label="APR" suffix="%" value={input.aprPercent} min={0} max={100} slider sliderMax={40} sliderStep={0.1} onChange={set('aprPercent')} />
          <NumberField label="Fixed Payment To Compare" prefix={symbol} value={input.fixedPayment} min={0} slider sliderMax={Math.max(1000, input.balance / 4)} sliderStep={10} onChange={set('fixedPayment')} />
          <NumberField label="Minimum — % of balance" suffix="%" value={input.minimumPercent} min={0.5} max={20} hint="Typically 1–3%" onChange={set('minimumPercent')} />
          <NumberField label="Minimum — floor" prefix={symbol} value={input.minimumFloor} min={0} hint="The minimum never goes below this" onChange={set('minimumFloor')} />
        </div>

        {fixed.neverPaysOff ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            A fixed payment of {money(input.fixedPayment)} doesn't even cover the monthly interest of{' '}
            {money((input.balance * input.aprPercent) / 100 / 12)} — the balance would grow forever. Raise the payment.
          </p>
        ) : minimumOnly.neverPaysOff ? (
          // No finite comparison exists: the minimum never clears this balance.
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              On the minimum alone, this card is never paid off
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              The minimum barely covers the interest, so the balance never really falls. Paying{' '}
              {money(input.fixedPayment)}/mo clears it in {formatMonths(fixed.months)} for{' '}
              {money(fixed.totalInterest)} of interest.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              Paying {money(input.fixedPayment)}/mo instead of the minimum saves {money(result.interestSaved ?? 0)}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              And it clears the card {formatMonths(result.monthsSaved ?? 0)} sooner — {formatMonths(fixed.months)}{' '}
              instead of {formatMonths(minimumOnly.months)}.
            </p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Plan
            title="Minimum payments only"
            tone="bad"
            months={minimumOnly.months}
            interest={minimumOnly.totalInterest}
            paid={minimumOnly.totalPaid}
            neverPaysOff={minimumOnly.neverPaysOff}
            firstPayment={Math.max(input.minimumFloor, input.balance * (input.minimumPercent / 100))}
          />
          <Plan
            title={`Fixed ${money(input.fixedPayment)} a month`}
            tone="good"
            months={fixed.months}
            interest={fixed.totalInterest}
            paid={fixed.totalPaid}
            neverPaysOff={fixed.neverPaysOff}
            firstPayment={input.fixedPayment}
          />
        </div>

        {!fixed.neverPaysOff && !minimumOnly.neverPaysOff && (
          <TwoSeriesChart
            title="Balance remaining"
            seriesA={{ label: `Fixed ${money(input.fixedPayment)}/mo`, values: fixed.balanceByMonth }}
            seriesB={{ label: 'Minimum only', values: minimumOnly.balanceByMonth }}
          />
        )}
      </div>
    </PageContainer>
  )
}

function Plan({
  title,
  tone,
  months,
  interest,
  paid,
  neverPaysOff,
  firstPayment,
}: {
  title: string
  tone: 'good' | 'bad'
  months: number
  interest: number
  paid: number
  neverPaysOff: boolean
  firstPayment: number
}) {
  const { money } = useFormat()
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        tone === 'good'
          ? 'border-emerald-200 bg-white dark:border-emerald-800 dark:bg-slate-900'
          : 'border-red-200 bg-white dark:border-red-900 dark:bg-slate-900'
      }`}
    >
      <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">First payment {money(firstPayment)}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-slate-400">Time to clear</dt>
          <dd className="text-2xl font-bold text-slate-900 dark:text-white">{neverPaysOff ? 'Never' : formatMonths(months)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Interest paid</dt>
          <dd className="text-2xl font-bold text-slate-900 dark:text-white">{money(interest)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-slate-400">Total paid</dt>
          <dd className="text-lg font-semibold text-slate-700 dark:text-slate-200">{money(paid)}</dd>
        </div>
      </dl>
    </div>
  )
}
