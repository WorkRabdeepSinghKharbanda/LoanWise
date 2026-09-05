import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CURRENCIES, formatCompact, formatCurrency } from '../utils/loanMath'
import type { CurrencyCode } from '../utils/loanMath'
import { LOCALES, translate } from '../i18n/translations'
import type { Locale, StringKey } from '../i18n/translations'

type Theme = 'light' | 'dark'

interface Settings {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  theme: Theme
  toggleTheme: () => void
  locale: Locale
  setLocale: (l: Locale) => void
}

const SettingsContext = createContext<Settings | null>(null)

function readStored<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) || fallback
  } catch {
    return fallback
  }
}

/**
 * Stored values are user-editable and can outlive a currency being removed, so
 * anything unrecognised falls back rather than reaching Intl.NumberFormat
 * (which throws on an unknown code and would take the whole app down).
 */
function readCurrency(): CurrencyCode {
  const stored = readStored<string>('currency', 'USD')
  return stored in CURRENCIES ? (stored as CurrencyCode) : 'USD'
}

function readLocale(): Locale {
  const stored = readStored<string>('locale', 'en')
  return stored in LOCALES ? (stored as Locale) : 'en'
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readCurrency)
  const [locale, setLocaleState] = useState<Locale>(readLocale)
  // Whether the viewer has ever explicitly toggled the theme — until they do, it should keep
  // following the OS setting live, not just read it once at load.
  const [explicitTheme, setExplicitTheme] = useState(() => readStored<string>('theme', '') !== '')
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = readStored<string>('theme', '')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (explicitTheme || !window.matchMedia) return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [explicitTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    // Browser chrome (mobile status bar, PWA task switcher) should match the app, not stay stuck on light.
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#4f46e5')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Private mode / blocked storage — the toggle still works for this session.
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next)
    try {
      localStorage.setItem('currency', next)
    } catch {
      // Ignore — currency just won't persist.
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem('locale', next)
    } catch {
      // Ignore — language just won't persist.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setExplicitTheme(true)
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, theme, toggleTheme, locale, setLocale }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

/** Currency-aware formatters bound to the current setting. */
export function useFormat() {
  const { currency } = useSettings()
  return {
    currency,
    money: useCallback((value: number) => formatCurrency(value, currency), [currency]),
    compact: useCallback((value: number) => formatCompact(value, currency), [currency]),
  }
}

/** Translated UI strings bound to the current locale — falls back to English for any missing key. */
export function useT() {
  const { locale } = useSettings()
  return useCallback((key: StringKey) => translate(locale, key), [locale])
}
