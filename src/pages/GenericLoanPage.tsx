import { useLoanCalculator } from '../hooks/useLoanCalculator'
import { LoanForm } from '../components/LoanForm'
import { CalculatorResult } from '../components/CalculatorResult'
import { PageContainer } from '../components/PageContainer'
import { PrepaymentPanel } from '../components/PrepaymentPanel'
import { RateSensitivity } from '../components/RateSensitivity'
import { AprPanel } from '../components/AprPanel'
import { AdSlot } from '../components/AdSlot'
import { Seo } from '../components/Seo'
import { Tabs } from '../components/Tabs'
import type { LoanTypeConfig } from '../types/loan'

export function GenericLoanPage({ config }: { config: LoanTypeConfig }) {
  const defaults = {
    principal: config.defaultPrincipal,
    annualRatePercent: config.defaultRatePercent,
    termMonths: config.defaultTermMonths,
    extraMonthlyPayment: 0,
  }
  const { input, setInput, result } = useLoanCalculator(defaults)

  return (
    <PageContainer>
      <Seo title={`${config.label} Calculator`} description={`${config.blurb} See monthly payment, total interest and the full amortization schedule.`} />
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-950">{config.icon}</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{config.label} Calculator</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{config.blurb}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setInput(defaults)}
              className="no-print rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
          </div>
          <LoanForm input={input} onChange={setInput} typicalRateRange={config.typicalRateRange} />
        </div>

        <Tabs
          tabs={[
            {
              id: 'results',
              label: 'Results',
              content: (
                <CalculatorResult
                  result={result}
                  recurringExtra={input.extraMonthlyPayment ?? 0}
                  filename={`${config.id}-loan-schedule.csv`}
                  scenarioLabel={config.label}
                />
              ),
            },
            {
              id: 'prepayment',
              label: 'Pay It Off Faster',
              content: <PrepaymentPanel input={input} onChange={setInput} result={result} />,
            },
            {
              id: 'advanced',
              label: 'Advanced',
              content: (
                <>
                  <AprPanel input={input} />
                  <RateSensitivity input={input} />
                </>
              ),
            },
          ]}
        />

        <AdSlot name="resultsBottom" />
      </div>
    </PageContainer>
  )
}
