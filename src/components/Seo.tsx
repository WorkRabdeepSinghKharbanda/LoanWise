import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`

/**
 * Per-page title/description/canonical/OG/Twitter tags. React 19 hoists
 * these into <head> natively, so no helmet library is needed.
 *
 * Canonical is derived from the route path only, deliberately dropping the
 * query string — many calculator pages carry shareable state in the URL
 * (?amount=&rate=&term=...), and without a canonical tag each shared link
 * would look like separate duplicate-content pages to a crawler.
 */
export function Seo({ title, description }: { title: string; description: string }) {
  const location = useLocation()
  const canonical = `${SITE_URL}${location.pathname}`
  const fullTitle = `${title} · LoanWise`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="LoanWise" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
    </>
  )
}
