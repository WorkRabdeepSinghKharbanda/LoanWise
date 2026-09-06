const KEY = 'ad-consent'
const CHANGE_EVENT = 'ad-consent-changed'

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
  // Same-tab siblings (AdSlot instances elsewhere in the tree) don't get a native `storage`
  // event for a same-tab write — dispatch our own so every mounted AdSlot re-renders immediately
  // instead of only picking up consent on their next unrelated re-render or remount.
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** For useSyncExternalStore: notifies on this tab's own change event and cross-tab storage events. */
export function subscribeConsent(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
