import { useRef } from 'react'
import { useFormat } from '../../context/SettingsContext'
import { ChartDownloadButton } from './ChartDownloadButton'
import type { RentVsBuyYear } from '../../types/loan'

const W = 720
const H = 260
const PAD = { top: 16, right: 16, bottom: 34, left: 66 }

/**
 * Two series (rent vs buy) over time — categorical color, legend always present,
 * both lines direct-labeled at their end point.
 */
export function RentVsBuyChart({ years, breakEvenYear }: { years: RentVsBuyYear[]; breakEvenYear: number | null }) {
  const { compact, money } = useFormat()
  const svgRef = useRef<SVGSVGElement>(null)
  if (years.length === 0) return null

  const values = years.flatMap((y) => [y.rentCost, y.buyCost])
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const x = (year: number) => PAD.left + ((year - 1) / Math.max(1, years.length - 1)) * plotW
  const y = (value: number) => PAD.top + plotH - ((value - min) / (max - min)) * plotH
  const line = (key: 'rentCost' | 'buyCost') => years.map((yr) => `${x(yr.year)},${y(yr[key])}`).join(' ')

  const last = years[years.length - 1]

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Cumulative cost: renting vs buying</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Buying cost counts cash paid out minus the equity you'd walk away with.
          </p>
        </div>
        <ChartDownloadButton svgRef={svgRef} filename="rent-vs-buy.png" />
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <LegendItem color="var(--series-1)" label="Rent" value={money(last.rentCost)} />
        <LegendItem color="var(--series-2)" label="Buy" value={money(last.buyCost)} />
      </div>

      {/* Below ~480px the fixed viewBox shrinks axis text past legibility — scroll instead of squeezing it further. */}
      <div className="mt-3 overflow-x-auto">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Cumulative cost of renting versus buying over time">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const value = min + (max - min) * t
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(value)} y2={y(value)} stroke="var(--grid)" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(value) + 4} textAnchor="end" fontSize={11} fill="var(--ink-muted)">
                {compact(value)}
              </text>
            </g>
          )
        })}

        {/* Zero line, when the buy series dips below it (equity outruns outlay) */}
        {min < 0 && <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} stroke="var(--axis)" strokeWidth={1} strokeDasharray="3 3" />}

        {breakEvenYear && (
          <g>
            <line x1={x(breakEvenYear)} x2={x(breakEvenYear)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--axis)" strokeWidth={2} strokeDasharray="4 3" />
            <text x={x(breakEvenYear) + 6} y={PAD.top + 12} fontSize={11} fill="var(--ink-muted)">
              break-even
            </text>
          </g>
        )}

        <polyline points={line('rentCost')} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" />
        <polyline points={line('buyCost')} fill="none" stroke="var(--series-2)" strokeWidth={2} strokeLinejoin="round" />

        {years.map((yr) => (
          <g key={yr.year}>
            <circle cx={x(yr.year)} cy={y(yr.rentCost)} r={4} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={2} />
            <circle cx={x(yr.year)} cy={y(yr.buyCost)} r={4} fill="var(--series-2)" stroke="var(--surface-1)" strokeWidth={2} />
          </g>
        ))}

        {years
          .filter((yr) => yr.year === 1 || yr.year === years.length || yr.year % Math.ceil(years.length / 5) === 0)
          .map((yr) => (
            <text key={yr.year} x={x(yr.year)} y={H - 12} textAnchor="middle" fontSize={11} fill="var(--ink-muted)">
              yr {yr.year}
            </text>
          ))}
      </svg>
      </div>
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  )
}
