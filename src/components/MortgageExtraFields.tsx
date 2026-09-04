import { NumberField } from './NumberField'
import { useSettings } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import type { MortgageInput } from '../types/loan'

interface Props {
  input: MortgageInput
  onChange: (input: MortgageInput) => void
}

export function MortgageExtraFields({ input, onChange }: Props) {
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <NumberField
        label="Down Payment"
        prefix={symbol}
        value={input.downPayment}
        min={0}
        max={input.principal}
        onChange={(downPayment) => onChange({ ...input, downPayment })}
      />
      <NumberField
        label="Monthly Property Tax"
        prefix={symbol}
        value={input.monthlyPropertyTax}
        min={0}
        onChange={(monthlyPropertyTax) => onChange({ ...input, monthlyPropertyTax })}
      />
      <NumberField
        label="Monthly Insurance"
        prefix={symbol}
        value={input.monthlyInsurance}
        min={0}
        onChange={(monthlyInsurance) => onChange({ ...input, monthlyInsurance })}
      />
      <NumberField
        label="Monthly PMI"
        prefix={symbol}
        value={input.monthlyPmi}
        min={0}
        hint="Drops off at 20% equity"
        onChange={(monthlyPmi) => onChange({ ...input, monthlyPmi })}
      />
    </div>
  )
}
