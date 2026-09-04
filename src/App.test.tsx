import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SettingsProvider } from './context/SettingsContext'
import { Home } from './pages/Home'
import { GenericLoanPage } from './pages/GenericLoanPage'
import { MortgagePage } from './pages/MortgagePage'
import { EmiPage } from './pages/EmiPage'
import { StepUpEmiPage } from './pages/StepUpEmiPage'
import { ComparePage } from './pages/ComparePage'
import { AffordabilityPage } from './pages/AffordabilityPage'
import { RentVsBuyPage } from './pages/RentVsBuyPage'
import { RefinancePage } from './pages/RefinancePage'
import { DebtPayoffPage } from './pages/DebtPayoffPage'
import { SavedPage } from './pages/SavedPage'
import { QuizPage } from './pages/QuizPage'
import { CreditCardPage } from './pages/CreditCardPage'
import { StudentLoanPage } from './pages/StudentLoanPage'
import { LeaseVsBuyPage } from './pages/LeaseVsBuyPage'
import { BalloonPage } from './pages/BalloonPage'
import { SavingsGoalPage } from './pages/SavingsGoalPage'
import { CarCostPage } from './pages/CarCostPage'
import { ArmPage } from './pages/ArmPage'
import { BnplPage } from './pages/BnplPage'
import { MoratoriumPage } from './pages/MoratoriumPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { LOAN_TYPES } from './config/loanTypes'

/**
 * Render smoke tests: every page mounted for real, so a runtime crash
 * (bad hook order, undefined access, missing provider) fails CI instead of
 * shipping a blank screen.
 */
function renderPage(element: React.ReactNode) {
  return render(
    <SettingsProvider>
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={element} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SettingsProvider>,
  )
}

const PAGES: [string, React.ReactNode][] = [
  ['Home', <Home />],
  ['Mortgage', <MortgagePage />],
  ['EMI', <EmiPage />],
  ['Step-up EMI', <StepUpEmiPage />],
  ['Compare', <ComparePage />],
  ['Affordability', <AffordabilityPage />],
  ['Rent vs buy', <RentVsBuyPage />],
  ['Refinance', <RefinancePage />],
  ['Debt payoff', <DebtPayoffPage />],
  ['Saved', <SavedPage />],
  ['Quiz', <QuizPage />],
  ['Credit card', <CreditCardPage />],
  ['Student loan', <StudentLoanPage />],
  ['Lease vs buy', <LeaseVsBuyPage />],
  ['Balloon', <BalloonPage />],
  ['Savings goal', <SavingsGoalPage />],
  ['Car cost', <CarCostPage />],
  ['ARM', <ArmPage />],
  ['BNPL vs Loan', <BnplPage />],
  ['EMI Holiday', <MoratoriumPage />],
  ['Glossary', <GlossaryPage />],
  ...Object.values(LOAN_TYPES).map(
    (config) => [config.label, <GenericLoanPage config={config} />] as [string, React.ReactNode],
  ),
]

describe('every page renders', () => {
  it.each(PAGES)('%s mounts without crashing', (_name, element) => {
    const { container } = renderPage(element)
    // A crashed render leaves an empty tree; a real page has a heading.
    expect(container.querySelector('h1, h2')).not.toBeNull()
  })
})

describe('layout', () => {
  it('shows the brand and the theme toggle', () => {
    renderPage(<Home />)
    // Brand appears in both the header and the footer.
    expect(screen.getAllByText('LoanWise').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/switch to (light|dark) mode/i)).toBeDefined()
  })

  it('offers the currency selector', () => {
    renderPage(<Home />)
    expect(screen.getByLabelText('Currency')).toBeDefined()
  })
})
