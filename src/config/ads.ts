/**
 * Ad configuration. Ads are OFF until `enabled` is true. Slot ids are our own
 * descriptive names; `adSlotId` is the real AdSense ad-unit id from the
 * AdSense dashboard (Ads > By ad unit > "Ad unit ID") — leave it blank until
 * you've created that unit, AdSlot falls back to the reserved-space
 * placeholder until then. Heights are reserved up front to avoid layout shift.
 *
 * All four slots currently share one real ad unit ("CommonAd", 3418754801) —
 * AdSense allows the same responsive unit to be placed in multiple spots on
 * a page/site, it just auto-sizes to each container. Swap in dedicated
 * per-slot unit ids later if per-placement reporting becomes worth the
 * extra AdSense-dashboard setup.
 */
interface AdSlotConfig {
  id: string
  height: number
  adSlotId: string
}

export const ADS: { enabled: boolean; slots: Record<'homeTop' | 'resultsBottom' | 'footer' | 'articleMid', AdSlotConfig> } = {
  enabled: true,
  slots: {
    /** Between the hero and the calculator grid on the landing page. */
    homeTop: { id: 'home-top', height: 90, adSlotId: '3418754801' },
    /** Below the results on a calculator page — high intent, still out of the way. */
    resultsBottom: { id: 'results-bottom', height: 250, adSlotId: '3418754801' },
    /** Full-width strip above the footer. */
    footer: { id: 'footer', height: 90, adSlotId: '3418754801' },
    /** Between the article body and the FAQ/related-links block on a guide or blog page. */
    articleMid: { id: 'article-mid', height: 250, adSlotId: '3418754801' },
  },
}
