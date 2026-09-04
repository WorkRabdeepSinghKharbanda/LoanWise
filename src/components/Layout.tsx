import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CommandPalette } from './CommandPalette'
import { ShortcutsSheet } from './ShortcutsSheet'
import { AdSlot } from './AdSlot'
import { useSettings, useT } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import type { CurrencyCode } from '../utils/loanMath'
import { LOCALES } from '../i18n/translations'
import type { Locale } from '../i18n/translations'
import { NAV_GROUPS, ALL_NAV } from '../config/navigation'
import type { NavItem } from '../config/navigation'
import { recordVisit } from '../utils/recentlyViewed'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const { theme, toggleTheme, currency, setCurrency, locale, setLocale } = useSettings()
  const t = useT()
  const location = useLocation()

  // Any navigation closes the menus and returns to the top of the new page.
  useEffect(() => {
    setMenuOpen(false)
    setOpenGroup(null)
    window.scrollTo({ top: 0 })
    // Only track real calculator pages, not the landing page itself.
    if (ALL_NAV.some((item) => item.to === location.pathname)) recordVisit(location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25">
              LW
            </span>
            <span className="text-lg font-bold tracking-tight">{t('brand')}</span>
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
            {NAV_GROUPS.map((group) => (
              <MegaMenu
                key={group.title}
                title={group.title}
                items={group.items}
                currentPath={location.pathname}
                open={openGroup === group.title}
                onOpen={() => setOpenGroup(group.title)}
                onClose={() => setOpenGroup(null)}
              />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <CommandPalette />

            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label={t('language')}
              className="hidden rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 sm:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {Object.entries(LOCALES).map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.flag} {meta.label}
                </option>
              ))}
            </select>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label={t('currency')}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {Object.entries(CURRENCIES).map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.symbol} {code}
                </option>
              ))}
            </select>

            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t('menu')}
              aria-expanded={menuOpen}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="max-h-[70vh] overflow-auto border-t border-slate-200 bg-white px-5 py-4 lg:hidden dark:border-slate-800 dark:bg-slate-950">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="mb-5">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>
                <div className="grid gap-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2.5 text-sm transition ${
                          isActive
                            ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'text-slate-600 dark:text-slate-300'
                        }`
                      }
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <ShortcutsSheet />

      <div className="mx-auto w-full max-w-5xl px-6">
        <AdSlot name="footer" className="mb-10" />
      </div>

      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="text-sm text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 border-t border-slate-200 pt-8 text-center dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('brand')}</p>
            <p className="max-w-lg text-xs text-slate-400">{t('footerTagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MegaMenu({
  title,
  items,
  currentPath,
  open,
  onOpen,
  onClose,
}: {
  title: string
  items: NavItem[]
  currentPath: string
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const isActive = items.some((item) => item.to === currentPath)

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        onClick={open ? onClose : onOpen}
        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive || open
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`}
      >
        {title}
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full w-80 pt-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: active }) =>
                  `flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${
                    active ? 'bg-indigo-50 dark:bg-indigo-950/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <span className="mt-0.5 text-base">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{item.desc}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
