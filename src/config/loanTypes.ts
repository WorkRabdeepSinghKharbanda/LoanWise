import type { LoanTypeConfig } from '../types/loan'

export const LOAN_TYPES: Record<string, LoanTypeConfig> = {
  personal: {
    id: 'personal',
    label: 'Personal Loan',
    icon: '💰',
    blurb: 'Unsecured borrowing for anything — shorter terms, higher rates.',
    defaultPrincipal: 10000,
    defaultRatePercent: 10,
    defaultTermMonths: 36,
    typicalRateRange: [7, 18],
  },
  car: {
    id: 'car',
    label: 'Car Loan',
    icon: '🚗',
    blurb: 'Secured against the vehicle, typically 3–7 years.',
    defaultPrincipal: 25000,
    defaultRatePercent: 6.5,
    defaultTermMonths: 60,
    typicalRateRange: [4, 10],
  },
  home: {
    id: 'home',
    label: 'Home Loan',
    icon: '🏠',
    blurb: 'Long-term borrowing where small rate changes move real money.',
    defaultPrincipal: 300000,
    defaultRatePercent: 6.5,
    defaultTermMonths: 360,
    typicalRateRange: [5.5, 7.5],
  },
  gold: {
    id: 'gold',
    label: 'Gold Loan',
    icon: '🪙',
    blurb: 'Short-term borrowing against gold, secured and quick to close.',
    defaultPrincipal: 5000,
    defaultRatePercent: 9,
    defaultTermMonths: 24,
    typicalRateRange: [7, 12],
  },
}
