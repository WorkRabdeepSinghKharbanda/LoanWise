/**
 * Ad configuration. Ads are OFF until `enabled` is true — flip it when a
 * network is wired up in index.html. Slot ids are what you map to the ad
 * network's unit ids; heights are reserved up front to avoid layout shift.
 */
export const ADS = {
  enabled: false,
  slots: {
    /** Between the hero and the calculator grid on the landing page. */
    homeTop: { id: 'home-top', height: 90 },
    /** Below the results on a calculator page — high intent, still out of the way. */
    resultsBottom: { id: 'results-bottom', height: 250 },
    /** Full-width strip above the footer. */
    footer: { id: 'footer', height: 90 },
  },
} as const
