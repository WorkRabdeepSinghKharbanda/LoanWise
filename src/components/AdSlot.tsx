import { useEffect, useSyncExternalStore } from 'react'
import { ADS } from '../config/ads'
import { ADSENSE_PUBLISHER_ID, isAdsConfigured } from '../config/adsense'
import { getConsent, subscribeConsent } from '../utils/consent'

type SlotName = keyof typeof ADS.slots

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/**
 * Reserved advertising space. Renders nothing until `ADS.enabled` is switched
 * on in src/config/ads.ts, and reserves its height either way so turning ads
 * on doesn't shift the page (no layout shift, no CLS penalty).
 *
 * Once a slot has a real `adSlotId` (src/config/ads.ts), AdSense is
 * configured (src/config/adsense.ts), and the visitor has accepted the
 * cookie-consent banner, this renders a real AdSense unit and pushes it to
 * `adsbygoogle`. Until all three are true it falls back to the placeholder
 * box, so the page still looks right before launch or before consent.
 */
export function AdSlot({ name, className = '' }: { name: SlotName; className?: string }) {
  const slot = ADS.slots[name]
  // useSyncExternalStore (not a plain getConsent() call) so every mounted AdSlot re-renders the
  // instant consent changes — a plain read would go stale for slots that are siblings of the
  // banner rather than descendants, since nothing would otherwise trigger their re-render.
  const consent = useSyncExternalStore(subscribeConsent, getConsent)
  const live = ADS.enabled && isAdsConfigured() && slot.adSlotId !== '' && consent === 'accepted'

  useEffect(() => {
    if (!live) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not finished loading yet, or blocked by the browser — the reserved space stays empty either way.
    }
  }, [live])

  if (!ADS.enabled) return null

  if (live) {
    return (
      <ins
        className={`adsbygoogle no-print block ${className}`}
        style={{ display: 'block', minHeight: slot.height }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot.adSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    )
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`no-print flex w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 ${className}`}
      style={{ minHeight: slot.height }}
      data-ad-slot={slot.id}
    >
      <span className="text-xs uppercase tracking-widest text-slate-300 dark:text-slate-600">Advertisement</span>
    </aside>
  )
}
