import { useLocation } from 'react-router-dom'
import { NAV_GROUPS } from '../config/navigation'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`

/** Looks up which nav group a route belongs to, purely to label the breadcrumb trail. */
function findGroupTitle(pathname: string): string | null {
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) => item.to === pathname)) return group.title
  }
  return null
}

/**
 * Per-page title/description/canonical/OG/Twitter tags plus a BreadcrumbList
 * JSON-LD block. React 19 hoists title/meta/link into <head> natively, so no
 * helmet library is needed; index.html carries no per-page duplicates of
 * these tags, so there is exactly one of each per route, not two.
 *
 * Canonical is derived from the route path only, deliberately dropping the
 * query string — many calculator pages carry shareable state in the URL
 * (?amount=&rate=&term=...), and without a canonical tag each shared link
 * would look like separate duplicate-content pages to a crawler.
 */
export function Seo({
  title,
  description,
  noIndex = false,
}: {
  title: string
  description: string
  /** For pages whose content is entirely per-visitor localStorage state — see NavItem.noIndex. */
  noIndex?: boolean
}) {
  const location = useLocation()
  // index.html already carries the exact same title/description/canonical/OG/Twitter tags for
  // "/" (needed so non-JS crawlers and link-preview bots see correct tags before React mounts).
  // Rendering them again here would leave two of everything in <head> once React does mount.
  if (location.pathname === '/') return null

  const canonical = `${SITE_URL}${location.pathname}`
  const fullTitle = `${title} · LoanWise`
  const groupTitle = findGroupTitle(location.pathname)

  const breadcrumbJsonLd =
    location.pathname === '/'
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            ...(groupTitle ? [{ '@type': 'ListItem', position: 2, name: groupTitle }] : []),
            { '@type': 'ListItem', position: groupTitle ? 3 : 2, name: title },
          ],
        }

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, follow' : 'index, follow'} />
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

      {breadcrumbJsonLd && <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>}
    </>
  )
}
