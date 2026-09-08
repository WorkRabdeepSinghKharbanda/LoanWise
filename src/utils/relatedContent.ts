import { GUIDES, type Guide } from '../config/guides'
import { BLOG_POSTS, type BlogPost } from '../config/blog'

export interface RelatedEntry {
  to: string
  title: string
  description: string
  kind: 'Guide' | 'Blog'
}

function toEntry(item: Guide | BlogPost, kind: 'Guide' | 'Blog'): RelatedEntry {
  const base = kind === 'Guide' ? '/guides' : '/blog'
  return { to: `${base}/${item.slug}`, title: item.title, description: item.description, kind }
}

/**
 * Picks other guides/posts related to the current one, so readers have
 * somewhere to go next instead of a dead end — more pages per session, and a
 * denser internal-link graph for crawlers. Scored by how many calculator
 * links the two pieces share (a real topical signal, not just recency), with
 * a stable fallback so the same page always suggests the same set.
 */
export function relatedContent(current: Guide | BlogPost, limit = 3): RelatedEntry[] {
  const currentLinks = new Set(current.related.map((r) => r.to))
  const pool = [
    ...GUIDES.map((item) => ({ item, kind: 'Guide' as const })),
    ...BLOG_POSTS.map((item) => ({ item, kind: 'Blog' as const })),
  ].filter(({ item }) => item.slug !== current.slug)

  const scored = pool.map(({ item, kind }) => ({
    item,
    kind,
    score: item.related.filter((r) => currentLinks.has(r.to)).length,
  }))

  scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))

  return scored.slice(0, limit).map(({ item, kind }) => toEntry(item, kind))
}
