const KEY = 'recently-viewed'
const MAX = 6

export function recordVisit(path: string) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    const next = [path, ...prev.filter((p) => p !== path)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Non-fatal — the row just stays empty.
  }
}

export function loadRecentlyViewed(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
