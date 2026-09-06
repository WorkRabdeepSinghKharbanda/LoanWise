const KEY = 'ad-consent'

export type Consent = 'accepted' | 'declined'

/** null means no choice has been made yet — the banner should still show. */
export function getConsent(): Consent | null {
  try {
    const stored = localStorage.getItem(KEY)
    return stored === 'accepted' || stored === 'declined' ? stored : null
  } catch {
    return null
  }
}

export function setConsent(value: Consent) {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    // Blocked storage — the banner will just show again next visit, harmless.
  }
}
