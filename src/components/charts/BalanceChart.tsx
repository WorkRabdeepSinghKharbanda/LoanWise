import { useMemo, useRef, useState } from 'react'
import { useFormat } from '../../context/SettingsContext'
import { formatMonths } from '../../utils/loanMath'
import { ChartDownloadButton } from './ChartDownloadButton'
import type { AmortizationRow } from '../../types/loan'

const W = 720
const H = 240
const PAD = { top: 16, right: 16, bottom: 30, left: 62 }

interface Props {
  schedule: AmortizationRow[]
  /** Optional vertical marker, e.g. the month PMI falls away. */
  marker?: { month: number; label: string } | null
}

/** Remaining balance over time — single series, so no legend box; the title names it. */
export function BalanceChart({ schedule, marker }: Props) {
  const { money, compact } = useFormat()
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const geometry = useMemo(() => {
    if (schedule.length === 0) return null
    const maxBalance = schedule[0].balance + schedule[0].principalPaid
    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom
    const x = (month: number) => PAD.left + ((month - 1) / Math.max(1, schedule.length - 1)) * plotW
    const y = (balance: number) => PAD.top + plotH - (balance / Math.max(1, maxBalance)) * plotH
    const points = schedule.map((row) => `${x(row.month)},${y(row.balance)}`).join(' ')
    return { x, y, points, maxBalance, plotH, baseline: PAD.top + plotH }
  }, [schedule])

  if (!geometry) return null
  const { x, y, points, maxBalance, baseline } = geometry
  const hovered = hover !== null ? schedule[hover] : null

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const svgX = ratio * W
    const index = Math.round(((svgX - PAD.left) / (W - PAD.left - PAD.right)) * (schedule.length - 1))
    setHover(Math.min(schedule.length - 1, Math.max(0, index)))
  }

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Remaining balance over time</h3>
        <div className="flex items-center gap-3">
          {hovered && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Month {hovered.month} · <span className="font-semibold text-slate-900 dark:text-white">{money(hovered.balance)}</span>
            </p>
          )}
          <ChartDownloadButton svgRef={svgRef} filename="balance-over-time.png" />
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full cursor-crosshair"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Loan balance falling from ${money(maxBalance)} to zero over ${schedule.length} months`}
      >
        {/* Recessive gridlines + y ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(maxBalance * t)} y2={y(maxBalance * t)} stroke="var(--grid)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(maxBalance * t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-muted)">
              {compact(maxBalance * t)}
            </text>
          </g>
        ))}

        {/* Area under the line, then the 2px line itself */}
        <polygon points={`${PAD.left},${baseline} ${points} ${x(schedule.length)},${baseline}`} fill="var(--series-1)" opacity={0.12} />
        <polyline points={points} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" />

        {marker && marker.month <= schedule.length && (
          <g>
            <line x1={x(marker.month)} x2={x(marker.month)} y1={PAD.top} y2={baseline} stroke="var(--series-2)" strokeWidth={2} strokeDasharray="4 3" />
            <text x={x(marker.month) + 6} y={PAD.top + 12} fontSize={11} fill="var(--series-2)">
              {marker.label}
            </text>
          </g>
        )}

        {/* x ticks: first, middle, last — deduped, since a 1–2 month loan collapses them */}
        {[...new Set([1, Math.ceil(schedule.length / 2), schedule.length])].map((m) => (
          <text key={m} x={x(m)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--ink-muted)">
            {formatMonths(m)}
          </text>
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={baseline} y2={baseline} stroke="var(--axis)" strokeWidth={1} />

        {/* Hover crosshair + marker, ringed against the surface */}
        {hovered && (
          <g>
            <line x1={x(hovered.month)} x2={x(hovered.month)} y1={PAD.top} y2={baseline} stroke="var(--axis)" strokeWidth={1} />
            <circle cx={x(hovered.month)} cy={y(hovered.balance)} r={5} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={2} />
          </g>
        )}
      </svg>
    </div>
  )
}
