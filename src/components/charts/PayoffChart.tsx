import { useRef } from 'react'
import { useFormat } from '../../context/SettingsContext'
import { ChartDownloadButton } from './ChartDownloadButton'

const W = 720
const H = 240
const PAD = { top: 16, right: 16, bottom: 32, left: 66 }

/** Two strategies, one axis: total debt remaining month by month. */
export function PayoffChart({ snowball, avalanche }: { snowball: number[]; avalanche: number[] }) {
  const { compact } = useFormat()
  const svgRef = useRef<SVGSVGElement>(null)
  const months = Math.max(snowball.length, avalanche.length)
  if (months === 0) return null

  const max = Math.max(...snowball, ...avalanche, 1)
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const x = (month: number) => PAD.left + (month / Math.max(1, months - 1)) * plotW
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH
  const path = (series: number[]) => series.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Total debt remaining</h2>
        <ChartDownloadButton svgRef={svgRef} filename="debt-payoff.png" />
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        <Legend color="var(--series-1)" label={`Avalanche · ${avalanche.length} mo`} />
        <Legend color="var(--series-2)" label={`Snowball · ${snowball.length} mo`} />
      </div>

      {/* Below ~480px the fixed viewBox shrinks axis text past legibility — scroll instead of squeezing it further. */}
      <div className="mt-3 overflow-x-auto">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Debt remaining over time under each strategy">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(max * t)} y2={y(max * t)} stroke="var(--grid)" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(max * t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-muted)">
                {compact(max * t)}
              </text>
            </g>
          ))}

          <polyline points={path(avalanche)} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" />
          <polyline points={path(snowball)} fill="none" stroke="var(--series-2)" strokeWidth={2} strokeLinejoin="round" strokeDasharray="5 3" />

          <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="var(--axis)" strokeWidth={1} />
          {[...new Set([0, Math.floor(months / 2), months - 1])].map((m) => (
            <text key={m} x={x(m)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--ink-muted)">
              mo {m + 1}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
      <span className="text-xs text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  )
}
