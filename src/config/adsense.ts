/**
 * Google AdSense wiring. Everything here is inert until the placeholder
 * publisher id is replaced — see ADS.enabled (src/config/ads.ts) for the
 * separate "are ads on at all" switch, and consent.ts for the "has the
 * visitor said yes" gate. The AdSense script must never load before both
 * are true (loading it pre-consent would itself be the GDPR violation).
 */
export const ADSENSE_PUBLISHER_ID = 'ca-pub-0000000000000000'

/** True once the placeholder above has actually been replaced with a real id. */
export function isAdsConfigured(): boolean {
  return ADSENSE_PUBLISHER_ID !== 'ca-pub-0000000000000000'
}

const SCRIPT_ID = 'adsbygoogle-script'

/** Injects the AdSense loader script once. Safe to call more than once — no-ops after the first. */
export function loadAdsenseScript() {
  if (document.getElementById(SCRIPT_ID)) return
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}
