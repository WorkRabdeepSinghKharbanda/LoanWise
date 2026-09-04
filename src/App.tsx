import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SettingsProvider } from './context/SettingsContext'
import { Home } from './pages/Home'
import { GenericLoanPage } from './pages/GenericLoanPage'
import { MortgagePage } from './pages/MortgagePage'
import { EmiPage } from './pages/EmiPage'
import { StepUpEmiPage } from './pages/StepUpEmiPage'
import { ComparePage } from './pages/ComparePage'
import { AffordabilityPage } from './pages/AffordabilityPage'
import { RentVsBuyPage } from './pages/RentVsBuyPage'
import { QuizPage } from './pages/QuizPage'
import { RefinancePage } from './pages/RefinancePage'
import { DebtPayoffPage } from './pages/DebtPayoffPage'
import { SavedPage } from './pages/SavedPage'
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

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              {Object.values(LOAN_TYPES).map((config) => (
                // A new entry in LOAN_TYPES gets its route for free.
                <Route key={config.id} path={`/loan/${config.id}`} element={<GenericLoanPage config={config} />} />
              ))}
              <Route path="/mortgage" element={<MortgagePage />} />
              <Route path="/arm" element={<ArmPage />} />
              <Route path="/emi" element={<EmiPage />} />
              <Route path="/emi/step-up" element={<StepUpEmiPage />} />
              <Route path="/balloon" element={<BalloonPage />} />
              <Route path="/moratorium" element={<MoratoriumPage />} />
              <Route path="/affordability" element={<AffordabilityPage />} />
              <Route path="/savings-goal" element={<SavingsGoalPage />} />
              <Route path="/rent-vs-buy" element={<RentVsBuyPage />} />
              <Route path="/refinance" element={<RefinancePage />} />
              <Route path="/credit-card" element={<CreditCardPage />} />
              <Route path="/student-loan" element={<StudentLoanPage />} />
              <Route path="/debt-payoff" element={<DebtPayoffPage />} />
              <Route path="/lease-vs-buy" element={<LeaseVsBuyPage />} />
              <Route path="/car-cost" element={<CarCostPage />} />
              <Route path="/bnpl" element={<BnplPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/quiz" element={<QuizPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </ErrorBoundary>
  )
}

export default App
