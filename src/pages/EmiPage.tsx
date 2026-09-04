import { Link } from 'react-router-dom'
import { useLoanCalculator } from '../hooks/useLoanCalculator'
import { LoanForm } from '../components/LoanForm'
import { CalculatorResult } from '../components/CalculatorResult'
import { PageContainer } from '../components/PageContainer'
import { PrepaymentPanel } from '../components/PrepaymentPanel'
import { RateSensitivity } from '../components/RateSensitivity'
import { Seo } from '../components/Seo'

export function EmiPage() {
  const { input, setInput, result } = useLoanCalculator({
    principal: 500000,
    annualRatePercent: 8.5,
    termMonths: 60,
    extraMonthlyPayment: 0,
  })

  return (
    <PageContainer>
      <Seo title="EMI Calculator" description="Reducing-balance EMI calculator with prepayment savings and a full month-by-month schedule." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📊 EMI Calculator</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Reducing-balance EMI — interest recalculated on the outstanding principal every month.{' '}
            <Link to="/emi/step-up" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Need a step-up EMI instead?
            </Link>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <LoanForm input={input} onChange={setInput} />
        </div>
        <CalculatorResult
          result={result}
          recurringExtra={input.extraMonthlyPayment ?? 0}
          filename="emi-schedule.csv"
          scenarioLabel="EMI"
        />
        <PrepaymentPanel input={input} onChange={setInput} result={result} />
        <RateSensitivity input={input} />
      </div>
    </PageContainer>
  )
}
