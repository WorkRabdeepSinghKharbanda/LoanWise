/**
 * Google AdSense wiring. Everything here is inert until the placeholder
 * publisher id is replaced — see ADS.enabled (src/config/ads.ts) for the
 * separate "are ads on at all" switch. The loader script itself is a static
 * tag in index.html (loads unconditionally on every page, per AdSense's own
 * setup instructions) — not injected from here.
 */
export const ADSENSE_PUBLISHER_ID: string = 'ca-pub-5852027898822024'

/** True once the placeholder above has actually been replaced with a real id. */
export function isAdsConfigured(): boolean {
  return ADSENSE_PUBLISHER_ID !== 'ca-pub-0000000000000000'
}
