import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { Term } from '../components/Term'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, calculateAffordability } from '../utils/loanMath'
import type { AffordabilityInput } from '../types/loan'

const INITIAL: AffordabilityInput = {
  monthlyIncome: 7000,
  existingMonthlyDebt: 600,
  dtiPercent: 36,
  annualRatePercent: 6.5,
  termMonths: 360,
  downPayment: 60000,
}

export function AffordabilityPage() {
  const [input, setInput] = useState<AffordabilityInput>(INITIAL)
  const [coBorrowerIncome, setCoBorrowerIncome] = useState(0)
  const [jointApplication, setJointApplication] = useState(false)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  // A joint application counts both incomes against the same DTI limit.
  const combinedInput = jointApplication
    ? { ...input, monthlyIncome: input.monthlyIncome + coBorrowerIncome }
    : input

  const result = useMemo(() => calculateAffordability(combinedInput), [combinedInput])
  const set = <K extends keyof AffordabilityInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  return (
    <PageContainer>
      <Seo title="Affordability Calculator" description="Work out how much you can borrow from your income, existing debts and debt-to-income limit." />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Affordability"
          stats={[
            { label: 'Max Loan Amount', value: money(result.maxLoanAmount) },
            { label: 'Max Home Price', value: money(result.maxHomePrice) },
            { label: 'Max Monthly Payment', value: money(result.maxMonthlyPayment) },
            { label: 'Gross Monthly Income', value: money(combinedInput.monthlyIncome) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🎯 How Much Can I Borrow?</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Works backwards from your income and existing debts using a <Term>DTI</Term> limit — the same test
              lenders apply.
            </p>
          </div>
          <div className="no-print flex gap-2">
            <button
              onClick={() => {
                setInput(INITIAL)
                setCoBorrowerIncome(0)
                setJointApplication(false)
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
            <PrintButton />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField label="Gross Monthly Income" prefix={symbol} value={input.monthlyIncome} min={1} onChange={set('monthlyIncome')} />
            <NumberField label="Existing Monthly Debt" prefix={symbol} value={input.existingMonthlyDebt} min={0} hint="Cards, car, student loans" onChange={set('existingMonthlyDebt')} />
            <NumberField label="Debt-to-Income Limit" suffix="%" value={input.dtiPercent} min={1} max={60} hint="Lenders typically cap at 36–43%" onChange={set('dtiPercent')} />
            <NumberField label="Interest Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={100} onChange={set('annualRatePercent')} />
            <NumberField label="Term" suffix="months" value={input.termMonths} min={1} max={600} hint={`${(input.termMonths / 12).toFixed(0)} years`} onChange={set('termMonths')} />
            <NumberField label="Cash Down Payment" prefix={symbol} value={input.downPayment} min={0} onChange={set('downPayment')} />
          </div>

          <label className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300">
            <input
              type="checkbox"
              checked={jointApplication}
              onChange={(e) => setJointApplication(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
            />
            Applying with a co-borrower
          </label>
          {jointApplication && (
            <div className="mt-4 max-w-xs">
              <NumberField
                label="Co-Borrower's Monthly Income"
                prefix={symbol}
                value={coBorrowerIncome}
                min={0}
                hint="Added to yours for a combined DTI"
                onChange={setCoBorrowerIncome}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 text-center shadow-sm dark:border-indigo-800 dark:from-indigo-950/60 dark:to-slate-900">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">You could borrow up to</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{money(result.maxLoanAmount)}</p>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Buying power with your down payment: <span className="font-semibold text-slate-800 dark:text-slate-200">{money(result.maxHomePrice)}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Tile label="Max Monthly Payment" value={money(result.maxMonthlyPayment)} note={`${input.dtiPercent}% of income, minus existing debt`} />
          <Tile
            label="Payment Headroom Used"
            value={`${combinedInput.monthlyIncome > 0 ? (((result.maxMonthlyPayment + input.existingMonthlyDebt) / combinedInput.monthlyIncome) * 100).toFixed(0) : 0}%`}
            note={jointApplication ? 'of combined household income' : 'of gross monthly income'}
          />
        </div>

        {result.maxMonthlyPayment === 0 && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Existing debt already uses up the whole {input.dtiPercent}% allowance — no borrowing room at these numbers.
          </p>
        )}

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Got a number in mind?{' '}
          <Link to={`/mortgage`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Run it through the mortgage calculator →
          </Link>
        </p>
      </div>
    </PageContainer>
  )
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{note}</p>
    </div>
  )
}
