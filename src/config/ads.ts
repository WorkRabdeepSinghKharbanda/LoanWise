/**
 * Ad configuration. Ads are OFF until `enabled` is true. Slot ids are our own
 * descriptive names; `adSlotId` is the real AdSense ad-unit id from the
 * AdSense dashboard (Ads > By ad unit > "Ad unit ID") — leave it blank until
 * you've created that unit, AdSlot falls back to the reserved-space
 * placeholder until then. Heights are reserved up front to avoid layout shift.
 */
export const ADS = {
  enabled: false,
  slots: {
    /** Between the hero and the calculator grid on the landing page. */
    homeTop: { id: 'home-top', height: 90, adSlotId: '' },
    /** Below the results on a calculator page — high intent, still out of the way. */
    resultsBottom: { id: 'results-bottom', height: 250, adSlotId: '' },
    /** Full-width strip above the footer. */
    footer: { id: 'footer', height: 90, adSlotId: '' },
    /** Between the article body and the FAQ/related-links block on a guide or blog page. */
    articleMid: { id: 'article-mid', height: 250, adSlotId: '' },
  },
} as const
