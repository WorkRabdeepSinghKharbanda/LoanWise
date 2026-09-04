import { useMemo, useState } from 'react'
import { LoanForm } from '../components/LoanForm'
import { NumberField } from '../components/NumberField'
import { CalculatorResult } from '../components/CalculatorResult'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { useFormat } from '../context/SettingsContext'
import { calculateMonthlyPayment, calculateStepUpLoan } from '../utils/loanMath'
import type { StepUpInput } from '../types/loan'

const INITIAL: StepUpInput = {
  principal: 500000,
  annualRatePercent: 8.5,
  termMonths: 120,
  annualStepUpPercent: 5,
}

export function StepUpEmiPage() {
  const [input, setInput] = useState<StepUpInput>(INITIAL)
  const { money } = useFormat()

  const result = useMemo(() => calculateStepUpLoan(input), [input])
  const flatEmi = calculateMonthlyPayment(input)
  const finalPayment = result.schedule[result.schedule.length - 1]?.payment ?? 0

  return (
    <PageContainer>
      <Seo title="Step-Up EMI Calculator" description="Step-up EMI calculator — start with a lower payment that rises every year, and see the interest impact vs a flat EMI." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📈 Step-Up EMI Calculator</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Start lower and let the payment rise every year as your income grows. We solve for the starting EMI that still clears the loan on time.
          </p>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <LoanForm input={input} onChange={(v) => setInput({ ...input, ...v })} showExtra={false} />
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <div className="max-w-xs">
              <NumberField
                label="Annual Step-Up"
                suffix="% / yr"
                value={input.annualStepUpPercent}
                min={0}
                max={50}
                hint="Payment rises by this much every 12 months"
                onChange={(annualStepUpPercent) => setInput({ ...input, annualStepUpPercent })}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Compare label="Starting EMI" value={money(result.monthlyPayment)} note={`vs ${money(flatEmi)} flat`} highlight />
          <Compare label="Final EMI" value={money(finalPayment)} note={`year ${Math.ceil(result.payoffMonths / 12)}`} />
          <Compare
            label={result.interestSaved >= 0 ? 'Interest Saved vs Flat' : 'Extra Interest vs Flat'}
            value={money(Math.abs(result.interestSaved))}
            note={result.interestSaved >= 0 ? 'stepping up pays down faster' : 'the cost of starting lower'}
          />
        </div>

        <CalculatorResult result={result} filename="step-up-emi-schedule.csv" />
      </div>
    </PageContainer>
  )
}

function Compare({ label, value, note, highlight }: { label: string; value: string; note: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{note}</p>
    </div>
  )
}
