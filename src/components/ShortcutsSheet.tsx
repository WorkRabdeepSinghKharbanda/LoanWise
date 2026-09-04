import { useEffect, useState } from 'react'

const SHORTCUTS = [
  { keys: ['⌘', 'K'], desc: 'Search / jump to any calculator' },
  { keys: ['?'], desc: 'Show this list' },
  { keys: ['Esc'], desc: 'Close a dialog' },
]

/** Press "?" anywhere (outside a text field) to see what's available. */
export function ShortcutsSheet() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (e.key === '?' && !typing) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="font-semibold text-slate-900 dark:text-white">Keyboard shortcuts</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {SHORTCUTS.map((s) => (
            <li key={s.desc} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-sans text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
