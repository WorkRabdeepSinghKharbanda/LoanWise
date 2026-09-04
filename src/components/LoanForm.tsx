import { NumberField } from './NumberField'
import { RateContext } from './RateContext'
import { useSettings, useT } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import type { LoanInput } from '../types/loan'

interface Props {
  input: LoanInput
  onChange: (input: LoanInput) => void
  /** Show the extra-monthly-payment field inline (off when a prepayment panel handles it). */
  showExtra?: boolean
  /** Drag sliders under each field — off in narrow layouts like Compare cards. */
  sliders?: boolean
  /** Typical rate band for this loan type — shows a one-line "is my rate normal?" hint. */
  typicalRateRange?: [number, number]
}

export function LoanForm({ input, onChange, showExtra = false, sliders = true, typicalRateRange }: Props) {
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol
  const t = useT()
  // Slider range tracks the entered amount so it stays useful at any scale.
  const amountMax = Math.max(50000, Math.ceil((input.principal * 2) / 10000) * 10000)

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <NumberField
        label={t('loanAmount')}
        prefix={symbol}
        value={input.principal}
        min={1}
        slider={sliders}
        sliderMin={0}
        sliderMax={amountMax}
        sliderStep={Math.max(500, Math.round(amountMax / 200))}
        onChange={(principal) => onChange({ ...input, principal })}
      />
      <div>
        <NumberField
          label={t('interestRate')}
          suffix="% / yr"
          value={input.annualRatePercent}
          min={0}
          max={100}
          slider={sliders}
          sliderMin={0}
          sliderMax={25}
          sliderStep={0.05}
          onChange={(annualRatePercent) => onChange({ ...input, annualRatePercent })}
        />
        {typicalRateRange && <RateContext rate={input.annualRatePercent} range={typicalRateRange} />}
      </div>
      <NumberField
        label={t('term')}
        suffix="months"
        value={input.termMonths}
        min={1}
        max={600}
        slider={sliders}
        sliderMin={6}
        sliderMax={360}
        sliderStep={6}
        hint={`${(input.termMonths / 12).toFixed(1)} years`}
        onChange={(termMonths) => onChange({ ...input, termMonths })}
      />
      {showExtra && (
        <NumberField
          label="Extra Monthly Payment"
          prefix={symbol}
          value={input.extraMonthlyPayment ?? 0}
          min={0}
          hint="Optional — paid straight to principal"
          onChange={(extraMonthlyPayment) => onChange({ ...input, extraMonthlyPayment })}
        />
      )}
    </div>
  )
}
