import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, formatMonths, payoffDate } from '../utils/loanMath'
import { calculateSavingsGoal } from '../utils/advancedMath'
import type { SavingsGoalInput } from '../types/loan'

const INITIAL: SavingsGoalInput = {
  target: 60000,
  alreadySaved: 10000,
  monthlyContribution: 800,
  annualReturnPercent: 5,
}

export function SavingsGoalPage() {
  const [input, setInput] = useState<SavingsGoalInput>(INITIAL)
  const [deadlineMonths, setDeadlineMonths] = useState(36)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateSavingsGoal(input), [input])
  const set = <K extends keyof SavingsGoalInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const required = result.requiredForMonths(deadlineMonths)
  const progress = Math.min(100, (input.alreadySaved / Math.max(1, input.target)) * 100)

  return (
    <PageContainer>
      <Seo title="Down Payment Savings Goal" description="How long until you've saved your down payment — and what you'd need to contribute to hit a deadline." />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Savings Goal"
          stats={[
            { label: 'Target', value: money(input.target) },
            { label: 'Time to Reach It', value: result.months === null ? 'Never' : formatMonths(result.months) },
            { label: 'You Contribute', value: money(result.contributed) },
            { label: 'Interest Earned', value: money(result.interestEarned) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🏦 Savings Goal</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Work out when your down payment is ready — or what it takes to be ready by a date.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900">
          <div className="no-print col-span-full flex justify-end">
            <button
              onClick={() => setInput(INITIAL)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
          </div>
          <NumberField label="Target Amount" prefix={symbol} value={input.target} min={1} slider sliderMax={300000} sliderStep={1000} onChange={set('target')} />
          <NumberField label="Already Saved" prefix={symbol} value={input.alreadySaved} min={0} slider sliderMax={Math.max(10000, input.target)} sliderStep={500} onChange={set('alreadySaved')} />
          <NumberField label="Monthly Contribution" prefix={symbol} value={input.monthlyContribution} min={0} slider sliderMax={5000} sliderStep={50} onChange={set('monthlyContribution')} />
          <NumberField label="Expected Return" suffix="% / yr" value={input.annualReturnPercent} min={0} max={30} slider sliderMax={12} sliderStep={0.25} hint="A savings account is 3–5%; markets are riskier" onChange={set('annualReturnPercent')} />
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 text-center shadow-sm dark:border-indigo-800 dark:from-indigo-950/60 dark:to-slate-900">
          {result.months === null ? (
            <>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">At this rate</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">You never reach the target</p>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Increase the monthly contribution or the expected return.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">You'll hit {money(input.target)} in</p>
              <p className="mt-2 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{formatMonths(result.months)}</p>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                Around <span className="font-semibold text-slate-800 dark:text-slate-200">{payoffDate(result.months)}</span> · you'd
                contribute {money(result.contributed)} and earn {money(result.interestEarned)} in returns
              </p>
            </>
          )}

          <div className="mx-auto mt-6 max-w-md">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{money(input.alreadySaved)} saved</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-white dark:bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(1, progress)}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Need it by a certain date?</h2>
          <div className="mt-4 grid items-end gap-5 sm:grid-cols-2">
            <NumberField
              label="I need it in"
              suffix="months"
              value={deadlineMonths}
              min={1}
              max={480}
              slider
              sliderMin={1}
              sliderMax={120}
              hint={`${formatMonths(deadlineMonths)} — around ${payoffDate(deadlineMonths)}`}
              onChange={setDeadlineMonths}
            />
            <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/50">
              {required > 0 ? (
                <>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">Contribute every month</p>
                  <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{money(required)}</p>
                  <button
                    onClick={() => setInput({ ...input, monthlyContribution: required })}
                    className="mt-2 text-xs font-semibold text-indigo-700 underline dark:text-indigo-300"
                  >
                    Apply it
                  </button>
                </>
              ) : (
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  What you've already saved grows past the target by then — no further contributions needed.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Know your down payment?{' '}
          <Link to="/affordability" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            See what it lets you borrow →
          </Link>
        </p>
      </div>
    </PageContainer>
  )
}
