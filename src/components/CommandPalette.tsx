import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_NAV } from '../config/navigation'
import { useSettings } from '../context/SettingsContext'

/**
 * ⌘K / Ctrl-K jump-to-calculator. With 20 calculators, search beats hunting
 * through menus.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { toggleTheme } = useSettings()

  const commands = useMemo(
    () => [
      ...ALL_NAV.map((item) => ({ ...item, run: () => navigate(item.to) })),
      { to: '', label: 'Toggle light / dark mode', icon: '🌗', desc: 'Switch the theme', keywords: 'theme dark light', run: toggleTheme },
    ],
    [navigate, toggleTheme],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.desc} ${c.keywords ?? ''} ${c.to}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      // Focus after the dialog paints.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Keep the highlight inside the result list as it shrinks.
  useEffect(() => setCursor((c) => Math.min(c, Math.max(0, results.length - 1))), [results.length])

  const choose = (index: number) => {
    const command = results[index]
    if (!command) return
    setOpen(false)
    command.run()
  }

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(cursor)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search calculators"
        className="hidden items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-slate-100 sm:flex dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <span>Search</span>
        <kbd className="rounded border border-slate-300 px-1 font-sans text-[10px] dark:border-slate-600">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-24 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-label="Search calculators"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Search calculators…"
          className="w-full border-b border-slate-100 bg-transparent px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:text-white"
        />
        <ul className="max-h-80 overflow-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-400">Nothing matches that.</li>}
          {results.map((command, i) => (
            <li key={`${command.label}-${command.to}`}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === cursor ? 'bg-indigo-50 dark:bg-indigo-950/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{command.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{command.label}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{command.desc}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-400 dark:border-slate-800">
          ↑↓ to move · ⏎ to open · esc to close
        </p>
      </div>
    </div>
  )
}
