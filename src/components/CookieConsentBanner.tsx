import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ADS } from '../config/ads'
import { isAdsConfigured, loadAdsenseScript } from '../config/adsense'
import { getConsent, setConsent } from '../utils/consent'

/**
 * Shown once until the visitor accepts or declines. The AdSense script is
 * never loaded before Accept — loading it pre-consent would itself be the
 * GDPR violation, not just showing ads without asking.
 */
export function CookieConsentBanner() {
  const [choice, setChoice] = useState(getConsent)

  useEffect(() => {
    // A returning visitor who already accepted shouldn't have to click again for the script to load.
    if (choice === 'accepted' && ADS.enabled && isAdsConfigured()) loadAdsenseScript()
  }, [choice])

  if (choice !== null || !ADS.enabled) return null

  const accept = () => {
    setConsent('accepted')
    setChoice('accepted')
  }
  const decline = () => {
    setConsent('declined')
    setChoice('declined')
  }

  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
      <div className="flex max-w-lg flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
        <span>
          This site may show ads using cookies for personalization.{' '}
          <Link to="/privacy" className="underline">
            Privacy policy
          </Link>
        </span>
        <div className="ml-auto flex shrink-0 gap-2">
          <button onClick={decline} className="rounded-lg border border-white/30 px-3 py-1.5 font-medium dark:border-slate-900/20">
            Decline
          </button>
          <button onClick={accept} className="rounded-lg bg-indigo-500 px-3 py-1.5 font-semibold text-white hover:bg-indigo-400">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
