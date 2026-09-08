import { describe, expect, it } from 'vitest'
import { relatedContent } from './relatedContent'
import type { Guide } from '../config/guides'
import type { BlogPost } from '../config/blog'

function guide(overrides: Partial<Guide>): Guide {
  return {
    slug: 'g-default',
    title: 'Default Guide',
    description: 'desc',
    intro: 'intro',
    sections: [],
    faq: [],
    related: [],
    ...overrides,
  }
}

function post(overrides: Partial<BlogPost>): BlogPost {
  return {
    slug: 'p-default',
    title: 'Default Post',
    description: 'desc',
    date: '2026-01-01',
    intro: 'intro',
    sections: [],
    related: [],
    ...overrides,
  }
}

describe('relatedContent', () => {
  it('ranks by number of shared calculator links, highest first', () => {
    const current = guide({ slug: 'current', related: [{ to: '/mortgage', label: 'Mortgage' }, { to: '/refinance', label: 'Refinance' }] })
    const twoShared = guide({ slug: 'two-shared', title: 'Two Shared', related: [{ to: '/mortgage', label: 'Mortgage' }, { to: '/refinance', label: 'Refinance' }] })
    const oneShared = guide({ slug: 'one-shared', title: 'One Shared', related: [{ to: '/mortgage', label: 'Mortgage' }] })
    const zeroShared = guide({ slug: 'zero-shared', title: 'Zero Shared', related: [{ to: '/bnpl', label: 'BNPL' }] })

    const result = relatedContent(current, 'Guide', 3, [current, twoShared, oneShared, zeroShared], [])
    expect(result.map((r) => r.title)).toEqual(['Two Shared', 'One Shared', 'Zero Shared'])
  })

  it('breaks ties alphabetically by title', () => {
    const current = guide({ slug: 'current', related: [{ to: '/mortgage', label: 'Mortgage' }] })
    const zebra = guide({ slug: 'zebra', title: 'Zebra Guide', related: [{ to: '/mortgage', label: 'Mortgage' }] })
    const alpha = guide({ slug: 'alpha', title: 'Alpha Guide', related: [{ to: '/mortgage', label: 'Mortgage' }] })

    const result = relatedContent(current, 'Guide', 2, [current, zebra, alpha], [])
    expect(result.map((r) => r.title)).toEqual(['Alpha Guide', 'Zebra Guide'])
  })

  it('respects the limit', () => {
    const current = guide({ slug: 'current' })
    const others = Array.from({ length: 5 }, (_, i) => guide({ slug: `other-${i}`, title: `Other ${i}` }))

    const result = relatedContent(current, 'Guide', 2, [current, ...others], [])
    expect(result).toHaveLength(2)
  })

  it('excludes only the current item, not another item that happens to share its slug across kinds', () => {
    const current = guide({ slug: 'shared-slug', title: 'Current Guide' })
    const samePostSlug = post({ slug: 'shared-slug', title: 'Post With Same Slug' })
    const other = guide({ slug: 'other', title: 'Other Guide' })

    const result = relatedContent(current, 'Guide', 5, [current, other], [samePostSlug])
    const titles = result.map((r) => r.title)
    expect(titles).not.toContain('Current Guide')
    expect(titles).toContain('Post With Same Slug')
    expect(titles).toContain('Other Guide')
  })

  it('tags kind correctly for guides and posts', () => {
    const current = guide({ slug: 'current' })
    const otherGuide = guide({ slug: 'other-guide', title: 'Other Guide' })
    const otherPost = post({ slug: 'other-post', title: 'Other Post' })

    const result = relatedContent(current, 'Guide', 5, [current, otherGuide], [otherPost])
    expect(result.find((r) => r.title === 'Other Guide')).toMatchObject({ kind: 'Guide', to: '/guides/other-guide' })
    expect(result.find((r) => r.title === 'Other Post')).toMatchObject({ kind: 'Blog', to: '/blog/other-post' })
  })

  it('defaults to the real GUIDES/BLOG_POSTS content and never recommends the page to itself', async () => {
    const { GUIDES } = await import('../config/guides')
    const current = GUIDES[0]
    const result = relatedContent(current, 'Guide')
    expect(result.some((r) => r.to === `/guides/${current.slug}`)).toBe(false)
  })
})
