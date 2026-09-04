/**
 * One-line "is my rate normal?" indicator. Deliberately terse — a dot and a
 * word, not a chart — so it reads at a glance without competing with the
 * actual input.
 */
export function RateContext({ rate, range }: { rate: number; range: [number, number] }) {
  const [low, high] = range
  const status = rate < low ? 'below typical' : rate > high ? 'above typical' : 'typical range'
  const color =
    rate < low ? 'bg-emerald-500' : rate > high ? 'bg-amber-500' : 'bg-slate-400'

  return (
    <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {status} for this loan type ({low}–{high}%)
    </span>
  )
}
