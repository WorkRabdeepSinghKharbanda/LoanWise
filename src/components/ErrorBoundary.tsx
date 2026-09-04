import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * Catches render crashes so a bug in one calculator shows a recoverable
 * message instead of a blank white page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nothing to report to — but keep it in the console for bug reports.
    console.error('Calculator crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="max-w-md text-center">
          <p className="text-4xl">🧮💥</p>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">This calculator hit a snag</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Something in the numbers broke the page. Reloading usually fixes it — your saved scenarios are untouched.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Reload
            </button>
            <a
              href="/"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-200"
            >
              Start over
            </a>
          </div>
          <p className="mt-6 break-words font-mono text-xs text-slate-400">{this.state.error.message}</p>
        </div>
      </div>
    )
  }
}
