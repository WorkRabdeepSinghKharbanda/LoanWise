import { useRef } from 'react'
import { useFormat } from '../../context/SettingsContext'
import { ChartDownloadButton } from './ChartDownloadButton'

const W = 720
const H = 28
const GAP = 3

/**
 * Part-to-whole: how much of everything you repay is principal vs interest.
 * A 2-segment stacked bar, not a pie — direct-labeled, so identity never
 * rests on color alone. Rendered as SVG so it can be exported as a PNG.
 */
export function SplitBar({ principal, interest }: { principal: number; interest: number }) {
  const { money } = useFormat()
  const svgRef = useRef<SVGSVGElement>(null)
  const total = principal + interest
  const principalPct = total > 0 ? (principal / total) * 100 : 0
  const interestPct = 100 - principalPct

  const drawableWidth = W - GAP
  const principalWidth = Math.max(0, (principalPct / 100) * drawableWidth)
  const interestWidth = Math.max(0, (interestPct / 100) * drawableWidth)
  const interestX = principalWidth + GAP

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Where your money goes</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {interestPct.toFixed(1)}% of your total outlay is interest
          </p>
        </div>
        <ChartDownloadButton svgRef={svgRef} filename="principal-vs-interest.png" />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-5 h-7 w-full"
        role="img"
        aria-label={`Principal ${money(principal)}, interest ${money(interest)}`}
      >
        <rect x={0} y={0} width={principalWidth} height={H} rx={4} fill="var(--series-1)">
          <title>Principal {money(principal)}</title>
        </rect>
        <rect x={interestX} y={0} width={interestWidth} height={H} rx={4} fill="var(--series-2)">
          <title>Interest {money(interest)}</title>
        </rect>
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Legend color="var(--series-1)" label="Principal" value={money(principal)} pct={principalPct} />
        <Legend color="var(--series-2)" label="Interest" value={money(interest)} pct={interestPct} />
      </div>
    </div>
  )
}

function Legend({ color, label, value, pct }: { color: string; label: string; value: string; pct: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: color }} />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label} · {pct.toFixed(1)}%
        </p>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}
