export type Locale = 'en' | 'hi' | 'es'

export const LOCALES: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  hi: { label: 'हिन्दी', flag: '🇮🇳' },
  es: { label: 'Español', flag: '🇪🇸' },
}

/**
 * Shared UI chrome only — nav labels, buttons, common field names, and the
 * homepage hero. Page-specific prose (calculator explanations, tooltips)
 * stays English for now; translating those is a much larger follow-up pass.
 * Keep keys flat and short so a missing translation falls back to English
 * instead of rendering `undefined`.
 */
const STRINGS = {
  en: {
    brand: 'LoanWise',
    search: 'Search',
    findCalculator: 'Find my calculator',
    currency: 'Currency',
    language: 'Language',
    lightMode: 'Switch to light mode',
    darkMode: 'Switch to dark mode',
    menu: 'Menu',
    footerTagline: 'Every calculation runs in your browser — nothing you type is uploaded or tracked. Figures are estimates for comparison, not financial advice.',
    heroTag: 'calculators · free · no signup',
    heroTitlePrefix: 'Know the',
    heroTitleHighlight: 'real cost',
    heroTitleSuffix: 'before you sign',
    heroSubtitle: 'One amortization engine behind every calculator. Monthly payments, true APR, prepayment savings and month-by-month schedules — for every kind of borrowing.',
    ctaMortgage: 'Mortgage calculator',
    ctaQuiz: 'Find my calculator →',
    loanAmount: 'Loan Amount',
    interestRate: 'Interest Rate',
    term: 'Term',
    monthlyPayment: 'Monthly Payment',
    totalInterest: 'Total Interest',
    totalPayment: 'Total Payment',
    paidOffIn: 'Paid Off In',
    showSchedule: 'Show amortization schedule',
    hideSchedule: 'Hide amortization schedule',
  },
  hi: {
    brand: 'LoanWise',
    search: 'खोजें',
    findCalculator: 'मेरा कैलकुलेटर ढूंढें',
    currency: 'मुद्रा',
    language: 'भाषा',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    menu: 'मेनू',
    footerTagline: 'हर गणना आपके ब्राउज़र में होती है — आपकी जानकारी कहीं नहीं भेजी जाती। ये आंकड़े केवल अनुमान हैं, वित्तीय सलाह नहीं।',
    heroTag: 'कैलकुलेटर · मुफ़्त · साइनअप नहीं',
    heroTitlePrefix: 'असली',
    heroTitleHighlight: 'लागत',
    heroTitleSuffix: 'जानें, साइन करने से पहले',
    heroSubtitle: 'हर कैलकुलेटर के पीछे एक ही amortization इंजन। मासिक भुगतान, असली APR, prepayment की बचत — हर तरह के लोन के लिए।',
    ctaMortgage: 'मॉर्गेज कैलकुलेटर',
    ctaQuiz: 'मेरा कैलकुलेटर ढूंढें →',
    loanAmount: 'लोन राशि',
    interestRate: 'ब्याज दर',
    term: 'अवधि',
    monthlyPayment: 'मासिक भुगतान',
    totalInterest: 'कुल ब्याज',
    totalPayment: 'कुल भुगतान',
    paidOffIn: 'कब चुकेगा',
    showSchedule: 'भुगतान अनुसूची दिखाएं',
    hideSchedule: 'भुगतान अनुसूची छिपाएं',
  },
  es: {
    brand: 'LoanWise',
    search: 'Buscar',
    findCalculator: 'Buscar mi calculadora',
    currency: 'Moneda',
    language: 'Idioma',
    lightMode: 'Cambiar a modo claro',
    darkMode: 'Cambiar a modo oscuro',
    menu: 'Menú',
    footerTagline: 'Cada cálculo se ejecuta en tu navegador — nada de lo que escribes se envía ni se rastrea. Las cifras son estimaciones, no asesoría financiera.',
    heroTag: 'calculadoras · gratis · sin registro',
    heroTitlePrefix: 'Conoce el',
    heroTitleHighlight: 'costo real',
    heroTitleSuffix: 'antes de firmar',
    heroSubtitle: 'Un solo motor de amortización detrás de cada calculadora. Pagos mensuales, TAE real, ahorro por pagos anticipados y cronogramas mes a mes.',
    ctaMortgage: 'Calculadora hipotecaria',
    ctaQuiz: 'Buscar mi calculadora →',
    loanAmount: 'Monto del préstamo',
    interestRate: 'Tasa de interés',
    term: 'Plazo',
    monthlyPayment: 'Pago mensual',
    totalInterest: 'Interés total',
    totalPayment: 'Pago total',
    paidOffIn: 'Se paga en',
    showSchedule: 'Mostrar cronograma de amortización',
    hideSchedule: 'Ocultar cronograma de amortización',
  },
} as const

export type StringKey = keyof typeof STRINGS.en

export function translate(locale: Locale, key: StringKey): string {
  return STRINGS[locale]?.[key] ?? STRINGS.en[key]
}
