import { ADS } from '../config/ads'

type SlotName = keyof typeof ADS.slots

/**
 * Reserved advertising space. Renders nothing until `ADS.enabled` is switched
 * on in src/config/ads.ts, and reserves its height either way so turning ads
 * on doesn't shift the page (no layout shift, no CLS penalty).
 *
 * To go live with a network: set ADS.enabled = true, add the provider script to
 * index.html, and replace the placeholder below with the provider's <ins> tag —
 * nothing else in the app needs to change.
 */
export function AdSlot({ name, className = '' }: { name: SlotName; className?: string }) {
  const slot = ADS.slots[name]
  if (!ADS.enabled) return null

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
