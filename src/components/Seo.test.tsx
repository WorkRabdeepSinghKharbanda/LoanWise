import { describe, expect, it, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Seo } from './Seo'

let currentUnmount: (() => void) | null = null

afterEach(() => {
  // React 19 hoists <title>/<meta>/<link> into document.head itself and
  // tracks them for cleanup — unmount lets it remove them the same way it
  // installed them, rather than fighting its bookkeeping with manual DOM removal.
  currentUnmount?.()
  currentUnmount = null
})

function renderSeoAt(path: string, props: { noIndex?: boolean } = {}) {
  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <Seo title="Mortgage Calculator" description="Test description" {...props} />
    </MemoryRouter>,
  )
  currentUnmount = result.unmount
  return result
}

describe('Seo', () => {
  it('builds the canonical URL from the path only, dropping the query string', () => {
    renderSeoAt('/mortgage?amount=300000&rate=6.5&term=360')
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical?.getAttribute('href')).toBe('https://loan-calculator-ashen-six.vercel.app/mortgage')
  })

  it('sets a distinct canonical per route', () => {
    renderSeoAt('/emi')
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://loan-calculator-ashen-six.vercel.app/emi',
    )
  })

  it('sets robots to index,follow and matches title/og:title/twitter:title', () => {
    renderSeoAt('/mortgage')
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow')
    expect(document.title).toBe('Mortgage Calculator · LoanWise')
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(document.title)
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(document.title)
  })

  it('points og:image and twitter:image at the same absolute image', () => {
    renderSeoAt('/mortgage')
    const og = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const twitter = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    expect(og).toBe('https://loan-calculator-ashen-six.vercel.app/og-image.svg')
    expect(twitter).toBe(og)
  })

  it('sets robots to noindex,follow when noIndex is passed', () => {
    renderSeoAt('/saved', { noIndex: true })
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow')
  })

  it('renders a BreadcrumbList with Home as the first item', () => {
    renderSeoAt('/mortgage')
    const script = document.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script?.textContent ?? '{}')
    expect(json['@type']).toBe('BreadcrumbList')
    expect(json.itemListElement[0]).toMatchObject({ position: 1, name: 'Home' })
  })

  it('renders no breadcrumb JSON-LD on the homepage', () => {
    renderSeoAt('/')
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
  })
})
