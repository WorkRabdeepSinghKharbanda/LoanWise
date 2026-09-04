/** Standalone print/PDF trigger for pages that don't already have one via AmortizationTable. */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      ↓ Print / Save PDF
    </button>
  )
}
