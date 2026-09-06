import { describe, expect, it, beforeEach, vi } from 'vitest'
import { getConsent, setConsent, subscribeConsent } from './consent'

beforeEach(() => localStorage.clear())

describe('consent', () => {
  it('is null until a choice is made', () => {
    expect(getConsent()).toBeNull()
  })

  it('round-trips accepted and declined', () => {
    setConsent('accepted')
    expect(getConsent()).toBe('accepted')
    setConsent('declined')
    expect(getConsent()).toBe('declined')
  })

  it('falls back to null for a corrupted stored value', () => {
    localStorage.setItem('ad-consent', 'garbage')
    expect(getConsent()).toBeNull()
  })

  it('notifies subscribers when consent changes', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeConsent(callback)
    setConsent('accepted')
    expect(callback).toHaveBeenCalled()
    unsubscribe()
    callback.mockClear()
    setConsent('declined')
    expect(callback).not.toHaveBeenCalled()
  })
})
