import { useEffect, useState } from 'react'

interface Props {
  label: string
  value: number
  onChange: (value: number) => void
  /** Symbol or unit shown inside the field, e.g. "$" or "%". */
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  hint?: string
  /** Show a drag slider under the field. Needs a finite max. */
  slider?: boolean
  sliderMin?: number
  sliderMax?: number
  sliderStep?: number
}

/**
 * Free-typing numeric field. Deliberately NOT type="number": that adds spinners,
 * blocks a partially typed value ("1.", "") and turns an empty field into 0.
 * We keep the raw keystrokes in local state and only report valid numbers up.
 */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step,
  hint,
  slider,
  sliderMin,
  sliderMax,
  sliderStep,
}: Props) {
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)

  // Follow external changes (URL state, presets, reset) unless the user is typing.
  useEffect(() => {
    if (!focused) setRaw(String(value))
  }, [value, focused])

  const parsed = Number(raw)
  const isEmpty = raw.trim() === ''
  const invalid = isEmpty || !Number.isFinite(parsed) || parsed < min || (max !== undefined && parsed > max)

  const handleChange = (next: string) => {
    // Allow digits, one dot, and a leading minus only when negatives are permitted.
    const cleaned = next.replace(min < 0 ? /[^\d.-]/g : /[^\d.]/g, '')
    setRaw(cleaned)
    const n = Number(cleaned)
    if (cleaned.trim() !== '' && Number.isFinite(n) && n >= min && (max === undefined || n <= max)) onChange(n)
  }

  const handleBlur = () => {
    setFocused(false)
    // Snap an invalid or empty field back to the last good value.
    if (invalid) setRaw(String(value))
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div
        className={`flex items-center rounded-lg border bg-white transition dark:bg-slate-800 ${
          invalid && !isEmpty
            ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/40'
            : 'border-slate-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-600 dark:focus-within:ring-indigo-900/40'
        }`}
      >
        {prefix && <span className="pl-3 text-sm text-slate-400">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={raw}
          step={step}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2 text-slate-900 outline-none dark:text-white"
        />
        {suffix && <span className="pr-3 text-sm text-slate-400">{suffix}</span>}
      </div>
      {slider && (
        <input
          type="range"
          min={sliderMin ?? min}
          max={sliderMax ?? max ?? 100}
          step={sliderStep ?? step ?? 1}
          value={Number.isFinite(value) ? value : (sliderMin ?? min)}
          onChange={(e) => {
            setRaw(e.target.value)
            onChange(Number(e.target.value))
          }}
          className="mt-0.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-slate-700"
          aria-label={`${label} slider`}
        />
      )}
      {invalid && !isEmpty ? (
        <span className="text-xs text-red-600 dark:text-red-400">
          Enter a number between {min}
          {max !== undefined ? ` and ${max}` : ' or more'}
        </span>
      ) : (
        hint && <span className="text-xs text-slate-400">{hint}</span>
      )}
    </label>
  )
}
