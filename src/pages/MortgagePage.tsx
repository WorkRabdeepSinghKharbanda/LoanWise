import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoanForm } from '../components/LoanForm'
import { MortgageExtraFields } from '../components/MortgageExtraFields'
import { CalculatorResult } from '../components/CalculatorResult'
import { PageContainer } from '../components/PageContainer'
import { PrepaymentPanel } from '../components/PrepaymentPanel'
import { RateSensitivity } from '../components/RateSensitivity'
import { AprPanel } from '../components/AprPanel'
import { PointsBuydownPanel } from '../components/PointsBuydownPanel'
import { TaxReliefPanel } from '../components/TaxReliefPanel'
import { AdSlot } from '../components/AdSlot'
import { Seo } from '../components/Seo'
import { Tabs } from '../components/Tabs'
import { useFormat } from '../context/SettingsContext'
import { calculateLoan, formatMonths, pmiDropOffMonth } from '../utils/loanMath'
import type { MortgageInput } from '../types/loan'

const INITIAL: MortgageInput = {
  principal: 350000,
  annualRatePercent: 6.5,
  termMonths: 360,
  extraMonthlyPayment: 0,
  lumpSumAmount: 0,
  lumpSumMonth: 12,
  annualExtraPayment: 0,
  downPayment: 70000,
  monthlyPropertyTax: 300,
  monthlyInsurance: 100,
  monthlyPmi: 0,
}

export function MortgagePage() {
  const [input, setInput] = useState<MortgageInput>(INITIAL)
  const { money } = useFormat()

  const financedPrincipal = Math.max(0, input.principal - input.downPayment)
  // The loan behind the mortgage, carrying every prepayment field through.
  const loanInput = {
    principal: financedPrincipal,
    annualRatePercent: input.annualRatePercent,
    termMonths: input.termMonths,
    extraMonthlyPayment: input.extraMonthlyPayment,
    lumpSumAmount: input.lumpSumAmount,
    lumpSumMonth: input.lumpSumMonth,
    annualExtraPayment: input.annualExtraPayment,
  }

  const result = useMemo(
    () => calculateLoan(loanInput),
    [
      financedPrincipal,
      input.annualRatePercent,
      input.termMonths,
      input.extraMonthlyPayment,
      input.lumpSumAmount,
      input.lumpSumMonth,
      input.annualExtraPayment,
    ],
  )

  // The bare loan behind the mortgage — what the fee/points/rate panels reason about.
  const loanShape = {
    principal: financedPrincipal,
    annualRatePercent: input.annualRatePercent,
    termMonths: input.termMonths,
  }

  const extraMonthly = input.monthlyPropertyTax + input.monthlyInsurance + input.monthlyPmi
  // PMI normally falls away once the borrower holds 20% equity in the home.
  const pmiMonth = input.monthlyPmi > 0 ? pmiDropOffMonth(result.schedule, input.principal) : null

  return (
    <PageContainer>
      <Seo title="Mortgage Calculator" description="Mortgage payment calculator with down payment, property tax, insurance, PMI drop-off and amortization schedule." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🏦 Mortgage Calculator</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Full monthly cost including escrow.{' '}
            <Link to="/affordability" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Not sure how much you can borrow?
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex justify-end">
            <button
              onClick={() => setInput(INITIAL)}
              className="no-print rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
          </div>
          <LoanForm input={input} onChange={(v) => setInput({ ...input, ...v })} typicalRateRange={[5.5, 7.5]} />
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
            <MortgageExtraFields input={input} onChange={setInput} />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              Financed amount: <span className="font-semibold text-slate-800 dark:text-slate-200">{money(financedPrincipal)}</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Monthly escrow add-ons: <span className="font-semibold text-slate-800 dark:text-slate-200">{money(extraMonthly)}</span>
            </p>
            {pmiMonth && (
              <p className="text-slate-500 dark:text-slate-400">
                PMI drops at 20% equity: <span className="font-semibold text-slate-800 dark:text-slate-200">month {pmiMonth}</span> (
                {formatMonths(pmiMonth)}) — saving {money(input.monthlyPmi)}/mo after that
              </p>
            )}
          </div>
        </div>

        <Tabs
          tabs={[
            {
              id: 'results',
              label: 'Results',
              content: (
                <CalculatorResult
                  result={result}
                  extraMonthly={extraMonthly}
                  recurringExtra={input.extraMonthlyPayment ?? 0}
                  marker={pmiMonth ? { month: pmiMonth, label: 'PMI drops off' } : null}
                  filename="mortgage-schedule.csv"
                  scenarioLabel="Mortgage"
                />
              ),
            },
            {
              id: 'prepayment',
              label: 'Pay It Off Faster',
              content: (
                <PrepaymentPanel
                  input={loanInput}
                  // The panel edits the loan behind the mortgage, so keep the mortgage's
                  // own principal (the property price) rather than the financed amount.
                  onChange={(v) => setInput({ ...input, ...v, principal: input.principal })}
                  result={result}
                />
              ),
            },
            {
              id: 'advanced',
              label: 'Advanced',
              content: (
                <>
                  <AprPanel input={loanShape} />
                  <PointsBuydownPanel input={loanShape} />
                  <TaxReliefPanel schedule={result.schedule} />
                  <RateSensitivity input={loanShape} />
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
