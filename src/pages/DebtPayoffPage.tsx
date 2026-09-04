import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { Seo } from '../components/Seo'
import { PayoffChart } from '../components/charts/PayoffChart'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, calculateDebtPayoff, formatMonths } from '../utils/loanMath'
import type { Debt, PayoffStrategy } from '../types/loan'

const INITIAL_DEBTS: Debt[] = [
  { id: 'd1', name: 'Credit card', balance: 4200, annualRatePercent: 22.9, minimumPayment: 95 },
  { id: 'd2', name: 'Car loan', balance: 9800, annualRatePercent: 7.2, minimumPayment: 210 },
  { id: 'd3', name: 'Store card', balance: 900, annualRatePercent: 26.9, minimumPayment: 30 },
]

export function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS)
  const [budget, setBudget] = useState(600)
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche')
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const snowball = useMemo(() => calculateDebtPayoff(debts, budget, 'snowball'), [debts, budget])
  const avalanche = useMemo(() => calculateDebtPayoff(debts, budget, 'avalanche'), [debts, budget])
  const active = strategy === 'snowball' ? snowball : avalanche

  const totalMinimums = debts.reduce((sum, d) => sum + d.minimumPayment, 0)
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0)
  const budgetTooLow = budget < totalMinimums
  const stalled = active.balanceByMonth[active.balanceByMonth.length - 1] > 0

  const update = (id: string, patch: Partial<Debt>) => setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  const remove = (id: string) => setDebts((prev) => prev.filter((d) => d.id !== id))
  const add = () =>
    setDebts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Debt ${prev.length + 1}`, balance: 1000, annualRatePercent: 15, minimumPayment: 40 },
    ])

  const interestGap = snowball.totalInterest - avalanche.totalInterest

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <Seo title="Debt Payoff Planner" description="Snowball vs avalanche debt payoff planner — see which order clears your debts faster and cheaper." />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🏔️ Debt Payoff Planner</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            List your debts, set a monthly budget, and compare the two strategies. Every debt gets its minimum; the
            leftover attacks one target, and freed-up minimums roll forward.
          </p>
        </div>

        {/* Debts */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Your debts · {money(totalBalance)} total</h2>
            <button
              onClick={add}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add debt
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {debts.map((debt) => (
              <div key={debt.id} className="grid items-end gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
                <label className="flex flex-col gap-1.5 lg:col-span-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
                  <input
                    value={debt.name}
                    onChange={(e) => update(debt.id, { name: e.target.value })}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900/40"
                  />
                </label>
                <NumberField label="Balance" prefix={symbol} value={debt.balance} min={0} onChange={(balance) => update(debt.id, { balance })} />
                <NumberField label="Rate" suffix="% / yr" value={debt.annualRatePercent} min={0} max={100} onChange={(annualRatePercent) => update(debt.id, { annualRatePercent })} />
                <NumberField label="Minimum Payment" prefix={symbol} value={debt.minimumPayment} min={0} onChange={(minimumPayment) => update(debt.id, { minimumPayment })} />
                <button
                  onClick={() => remove(debt.id)}
                  disabled={debts.length === 1}
                  className="h-10 rounded-lg border border-slate-300 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 p-6 dark:border-slate-800">
            <div className="max-w-sm">
              <NumberField
                label="Total Monthly Budget"
                prefix={symbol}
                value={budget}
                min={0}
                slider
                sliderMin={0}
                sliderMax={Math.max(2000, totalMinimums * 4)}
                sliderStep={10}
                hint={`Minimums alone come to ${money(totalMinimums)}`}
                onChange={setBudget}
              />
            </div>
          </div>
        </div>

        {budgetTooLow && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            Your budget of {money(budget)} is below the {money(totalMinimums)} of minimum payments — raise it to make any
            progress.
          </p>
        )}
        {!budgetTooLow && stalled && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            At this budget the interest outruns the payments and the balance never clears. Increase the monthly budget.
          </p>
        )}

        {/* Strategy comparison */}
        <div className="grid gap-5 lg:grid-cols-2">
          <StrategyCard
            title="🏔️ Avalanche"
            subtitle="Highest interest rate first"
            months={avalanche.months}
            interest={avalanche.totalInterest}
            selected={strategy === 'avalanche'}
            badge={interestGap > 0 ? `Saves ${money(interestGap)}` : undefined}
            onSelect={() => setStrategy('avalanche')}
            stalled={avalanche.balanceByMonth[avalanche.balanceByMonth.length - 1] > 0}
          />
          <StrategyCard
            title="❄️ Snowball"
            subtitle="Smallest balance first"
            months={snowball.months}
            interest={snowball.totalInterest}
            selected={strategy === 'snowball'}
            badge="Quickest first win"
            onSelect={() => setStrategy('snowball')}
            stalled={snowball.balanceByMonth[snowball.balanceByMonth.length - 1] > 0}
          />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {interestGap > 0
            ? `Avalanche costs ${money(interestGap)} less interest. Snowball clears its first debt sooner, which some people need to stay motivated — the gap here is ${money(interestGap)} for that.`
            : 'Both strategies cost about the same here, so pick whichever you will actually stick to.'}
        </p>

        {!stalled && <PayoffChart snowball={snowball.balanceByMonth} avalanche={avalanche.balanceByMonth} />}

        {/* Payoff order */}
        {active.order.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Payoff order · {strategy === 'snowball' ? 'snowball' : 'avalanche'}
            </h2>
            <ol className="mt-4 flex flex-col gap-3">
              {active.order.map((entry, i) => (
                <li key={entry.name} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{entry.name}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    cleared month {entry.clearedMonth} ({formatMonths(entry.clearedMonth)}) · {money(entry.interestPaid)} interest
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

function StrategyCard({
  title,
  subtitle,
  months,
  interest,
  selected,
  badge,
  onSelect,
  stalled,
}: {
  title: string
  subtitle: string
  months: number
  interest: number
  selected: boolean
  badge?: string
  onSelect: () => void
  stalled: boolean
}) {
  const { money } = useFormat()
  return (
    <button
      onClick={onSelect}
      className={`rounded-2xl border p-6 text-left shadow-sm transition ${
        selected
          ? 'border-indigo-400 ring-2 ring-indigo-100 dark:border-indigo-600 dark:ring-indigo-900/40'
          : 'border-slate-200 hover:border-indigo-300 dark:border-slate-700'
      } bg-white dark:bg-slate-900`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {badge && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {badge}
          </span>
        )}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-slate-400">Debt-free in</dt>
          <dd className="text-2xl font-bold text-slate-900 dark:text-white">{stalled ? '—' : formatMonths(months)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Total interest</dt>
          <dd className="text-2xl font-bold text-slate-900 dark:text-white">{money(interest)}</dd>
        </div>
      </dl>
    </button>
  )
}
