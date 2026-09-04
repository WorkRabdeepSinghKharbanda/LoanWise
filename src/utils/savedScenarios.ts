const KEY = 'saved-scenarios'

export interface SavedScenario {
  id: string
  label: string
  /** Route + query string, so restoring is just a navigation. */
  href: string
  monthlyPayment: string
  savedAt: number
  note?: string
}

export function loadSaved(): SavedScenario[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(scenarios: SavedScenario[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(scenarios))
  } catch {
    // Blocked storage — saving is best-effort.
  }
}

/** Newest first, capped so the list stays usable. */
export function saveScenario(scenario: Omit<SavedScenario, 'id' | 'savedAt'>): SavedScenario[] {
  const next = [{ ...scenario, id: crypto.randomUUID(), savedAt: Date.now() }, ...loadSaved()].slice(0, 20)
  persist(next)
  return next
}

export function deleteScenario(id: string): SavedScenario[] {
  const next = loadSaved().filter((s) => s.id !== id)
  persist(next)
  return next
}

export function updateNote(id: string, note: string): SavedScenario[] {
  const next = loadSaved().map((s) => (s.id === id ? { ...s, note } : s))
  persist(next)
  return next
}
