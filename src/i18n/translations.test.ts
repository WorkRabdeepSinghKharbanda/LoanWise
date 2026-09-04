import { describe, expect, it } from 'vitest'
import { LOCALES, translate } from './translations'

const ALL_KEYS = [
  'brand',
  'search',
  'findCalculator',
  'currency',
  'language',
  'lightMode',
  'darkMode',
  'menu',
  'footerTagline',
  'heroTag',
  'heroTitlePrefix',
  'heroTitleHighlight',
  'heroTitleSuffix',
  'heroSubtitle',
  'ctaMortgage',
  'ctaQuiz',
  'loanAmount',
  'interestRate',
  'term',
  'monthlyPayment',
  'totalInterest',
  'totalPayment',
  'paidOffIn',
  'showSchedule',
  'hideSchedule',
] as const

describe('translate', () => {
  it('returns the localized string for hi and es', () => {
    expect(translate('hi', 'loanAmount')).toBe('लोन राशि')
    expect(translate('es', 'loanAmount')).toBe('Monto del préstamo')
  })

  it('every locale defines every key with a non-empty value', () => {
    for (const locale of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      for (const key of ALL_KEYS) {
        expect(translate(locale, key)).toBeTruthy()
      }
    }
  })
})
