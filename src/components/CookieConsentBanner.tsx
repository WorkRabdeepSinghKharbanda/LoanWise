import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { ADS } from '../config/ads'
import { getConsent, setConsent, subscribeConsent } from '../utils/consent'

/**
 * Shown once until the visitor accepts or declines. Disclosure only — the
 * AdSense loader (a static tag in index.html) and AdSlot's rendering both run
 * unconditionally, so this choice doesn't gate anything; it's recorded via
 * consent.ts purely so the banner doesn't reappear every visit.
 */
export function CookieConsentBanner() {
  const choice = useSyncExternalStore(subscribeConsent, getConsent)

  if (choice !== null || !ADS.enabled) return null

  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
      <div className="flex max-w-lg flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
        <span>
          This site shows ads using cookies for personalization.{' '}
          <Link to="/privacy" className="underline">
            Privacy policy
          </Link>
        </span>
        <div className="ml-auto flex shrink-0 gap-2">
          <button onClick={() => setConsent('declined')} className="rounded-lg border border-white/30 px-3 py-1.5 font-medium dark:border-slate-900/20">
            Decline
          </button>
          <button onClick={() => setConsent('accepted')} className="rounded-lg bg-indigo-500 px-3 py-1.5 font-semibold text-white hover:bg-indigo-400">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
