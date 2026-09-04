import { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

/**
 * Page-level tabs. Only the active tab's content renders — this is what
 * keeps a calculator page short: the result, prepayment tools, and advanced
 * panels (APR, points, tax relief, sensitivity) don't all pile up on screen
 * at once, the reader picks what they want.
 */
export function Tabs({ tabs, defaultId }: { tabs: Tab[]; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id)
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div>
      <div role="tablist" className="no-print flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition ${
              tab.id === active
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.id === active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {/* Every tab's content stays mounted (just hidden) so switching tabs never
            re-triggers a calculation. `.tab-panel` is forced visible in print
            (see index.css) so a PDF export still contains every tab, not just
            whichever one happened to be open on screen. */}
        {tabs.map((tab) => (
          <div key={tab.id} hidden={tab.id !== activeTab?.id} className="tab-panel flex flex-col gap-6">
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
