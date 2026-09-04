import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'

interface Option {
  label: string
  /** Route this answer points at, when it settles the question. */
  route?: string
  next?: number
}

interface Question {
  prompt: string
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    prompt: 'What brings you here?',
    options: [
      { label: '🏠 Borrowing for a home', next: 1 },
      { label: '🚗 Borrowing for something else', next: 2 },
      { label: '🔄 I already have a loan', next: 3 },
      { label: '🏔️ I have several debts to clear', route: '/debt-payoff' },
    ],
  },
  {
    prompt: 'Where are you in the process?',
    options: [
      { label: "I don't know my budget yet", route: '/affordability' },
      { label: "I'm still deciding whether to buy at all", route: '/rent-vs-buy' },
      { label: 'I have a price and want the monthly cost', route: '/mortgage' },
      { label: 'I want to compare a few offers', route: '/compare' },
    ],
  },
  {
    prompt: 'What kind of borrowing?',
    options: [
      { label: '🚗 A car', route: '/loan/car' },
      { label: '🪙 Against gold', route: '/loan/gold' },
      { label: '💰 A personal loan', route: '/loan/personal' },
      { label: '📊 An EMI plan', route: '/emi' },
    ],
  },
  {
    prompt: 'What do you want to work out?',
    options: [
      { label: 'Whether refinancing is worth it', route: '/refinance' },
      { label: 'How much faster I could pay it off', route: '/emi' },
      { label: 'A lower payment that rises later', route: '/emi/step-up' },
      { label: 'How it compares to other offers', route: '/compare' },
    ],
  },
]

const DESTINATIONS: Record<string, string> = {
  '/loan/car': 'Car Loan Calculator',
  '/loan/gold': 'Gold Loan Calculator',
  '/loan/personal': 'Personal Loan Calculator',
  '/affordability': 'Affordability Calculator',
  '/rent-vs-buy': 'Rent vs Buy Calculator',
  '/mortgage': 'Mortgage Calculator',
  '/compare': 'Loan Comparison',
  '/refinance': 'Refinance Calculator',
  '/debt-payoff': 'Debt Payoff Planner',
  '/emi': 'EMI Calculator',
  '/emi/step-up': 'Step-Up EMI Calculator',
}

export function QuizPage() {
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [history, setHistory] = useState<number[]>([])

  const question = QUESTIONS[step]

  const choose = (option: Option) => {
    if (option.route) setAnswer(option.route)
    else if (option.next !== undefined) {
      setHistory((h) => [...h, step])
      setStep(option.next)
    }
  }

  const restart = () => {
    setAnswer(null)
    setStep(0)
    setHistory([])
  }

  const back = () => {
    setAnswer(null)
    setStep(history[history.length - 1] ?? 0)
    setHistory((h) => h.slice(0, -1))
  }

  return (
    <PageContainer>
      <Seo title="Which Calculator Do I Need?" description="Two quick questions to point you at the right loan calculator." />

      <div className="mx-auto max-w-xl">
        {answer ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Your match</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{DESTINATIONS[answer]}</h1>
            <Link
              to={answer}
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Open it →
            </Link>
            <button onClick={restart} className="mt-4 block w-full text-sm text-slate-500 hover:underline dark:text-slate-400">
              Start over
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-400">Question {history.length + 1} of 2</p>
            <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{question.prompt}</h1>
            <div className="mt-6 flex flex-col gap-3">
              {question.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => choose(option)}
                  className="rounded-xl border border-slate-200 px-5 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <button onClick={back} className="mt-6 text-sm text-slate-500 hover:underline dark:text-slate-400">
                ← Back
              </button>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
