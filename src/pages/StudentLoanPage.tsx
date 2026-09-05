import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { Term } from '../components/Term'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, formatMonths } from '../utils/loanMath'
import { calculateStudentLoan } from '../utils/advancedMath'
import type { StudentLoanInput } from '../types/loan'

const INITIAL: StudentLoanInput = {
  balance: 60000,
  annualRatePercent: 6,
  standardTermMonths: 120,
  annualIncome: 52000,
  povertyLine: 15650,
  discretionaryPercent: 10,
  annualIncomeGrowthPercent: 3,
  forgivenessMonths: 240,
}

export function StudentLoanPage() {
  const [input, setInput] = useState<StudentLoanInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateStudentLoan(input), [input])
  const set = <K extends keyof StudentLoanInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const { standard, incomeDriven } = result
  const idrCheaper = incomeDriven.totalPaid < standard.totalPaid

  return (
    <PageContainer>
      <Seo
        title="Student Loan Calculator"
        description="Compare standard repayment against income-driven repayment, including forgiveness and negative amortization."
      />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Student Loan Repayment"
          stats={[
            { label: 'Standard Payment', value: money(standard.monthlyPayment) },
            { label: 'IDR Starting Payment', value: money(incomeDriven.startingPayment) },
            { label: 'Standard Interest', value: money(standard.totalInterest) },
            { label: 'IDR Forgiven', value: incomeDriven.forgivenAmount > 0 ? money(incomeDriven.forgivenAmount) : 'None' },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🎓 Student Loan Repayment</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Standard repayment clears the loan on a fixed schedule. Income-driven repayment ties the payment to{' '}
              <Term>discretionary income</Term> and writes off whatever is left after the forgiveness window.
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

        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
          <NumberField label="Loan Balance" prefix={symbol} value={input.balance} min={1} slider sliderMax={250000} sliderStep={1000} onChange={set('balance')} />
          <NumberField label="Interest Rate" suffix="% / yr" value={input.annualRatePercent} min={0} max={30} slider sliderMax={15} sliderStep={0.1} onChange={set('annualRatePercent')} />
          <NumberField label="Standard Term" suffix="months" value={input.standardTermMonths} min={12} max={360} slider sliderMin={12} sliderMax={360} sliderStep={12} hint={formatMonths(input.standardTermMonths)} onChange={set('standardTermMonths')} />
          <NumberField label="Annual Income" prefix={symbol} value={input.annualIncome} min={0} slider sliderMax={200000} sliderStep={1000} onChange={set('annualIncome')} />
          <NumberField label="Protected Income" prefix={symbol} value={input.povertyLine} min={0} hint="Income shielded from the calculation" onChange={set('povertyLine')} />
          <NumberField label="Share of Discretionary Income" suffix="%" value={input.discretionaryPercent} min={1} max={30} slider sliderMin={1} sliderMax={25} hint="Common plans use 10–20%" onChange={set('discretionaryPercent')} />
          <NumberField label="Income Growth" suffix="% / yr" value={input.annualIncomeGrowthPercent} min={0} max={20} slider sliderMax={10} sliderStep={0.5} onChange={set('annualIncomeGrowthPercent')} />
          <NumberField label="Forgiveness After" suffix="months" value={input.forgivenessMonths} min={12} max={360} slider sliderMin={12} sliderMax={360} sliderStep={12} hint={formatMonths(input.forgivenessMonths)} onChange={set('forgivenessMonths')} />
        </div>

        {incomeDriven.negativelyAmortizing && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            ⚠️ Your income-driven payment is smaller than the interest accruing, so the balance grows for a while. That's
            normal on these plans — forgiveness, not payoff, is what ends the loan.
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Plan
            title="Standard repayment"
            payment={money(standard.monthlyPayment)}
            paymentNote="fixed every month"
            months={standard.months}
            interest={money(standard.totalInterest)}
            paid={money(standard.totalPaid)}
            highlight={!idrCheaper}
          />
          <Plan
            title="Income-driven repayment"
            payment={money(incomeDriven.startingPayment)}
            paymentNote="rises with your income"
            months={incomeDriven.months}
            interest={money(incomeDriven.totalInterest)}
            paid={money(incomeDriven.totalPaid)}
            highlight={idrCheaper}
            forgiven={incomeDriven.forgivenAmount > 0 ? money(incomeDriven.forgivenAmount) : undefined}
          />
        </div>

        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {incomeDriven.forgivenAmount > 0 ? (
            <>
              On this income, income-driven repayment costs {money(incomeDriven.totalPaid)} over{' '}
              {formatMonths(incomeDriven.months)} and writes off {money(incomeDriven.forgivenAmount)}. Standard
              repayment costs {money(standard.totalPaid)}. Forgiven amounts may be taxable — check your plan's rules.
            </>
          ) : (
            <>
              Your income clears the loan before forgiveness kicks in, in {formatMonths(incomeDriven.months)}. Against
              standard repayment that's a difference of {money(Math.abs(incomeDriven.totalPaid - standard.totalPaid))}.
            </>
          )}
        </p>
      </div>
    </PageContainer>
  )
}

function Plan({
  title,
  payment,
  paymentNote,
  months,
  interest,
  paid,
  highlight,
  forgiven,
}: {
  title: string
  payment: string
  paymentNote: string
  months: number
  interest: string
  paid: string
  highlight: boolean
  forgiven?: string
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        highlight
          ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{payment}</p>
      <p className="text-xs text-slate-400">{paymentNote}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
        <Metric label="Time on the plan" value={formatMonths(months)} />
        <Metric label="Interest" value={interest} />
        <Metric label="Total paid" value={paid} />
        {forgiven && <Metric label="Forgiven" value={forgiven} />}
      </dl>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  )
}
