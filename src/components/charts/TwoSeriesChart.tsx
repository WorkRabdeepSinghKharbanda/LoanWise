import { useRef, useState } from 'react'
import { useFormat } from '../../context/SettingsContext'
import { ChartDownloadButton } from './ChartDownloadButton'

const W = 720
const H = 240
const PAD = { top: 16, right: 16, bottom: 34, left: 66 }

interface Series {
  label: string
  values: number[]
}

interface Props {
  title: string
  seriesA: Series
  seriesB: Series
  /** Optional dashed vertical marker. */
  marker?: { index: number; label: string } | null
  xLabel?: (index: number) => string
}

/**
 * Two comparable series on one axis. Legend always present, and a table view
 * so the data is readable without seeing color.
 */
export function TwoSeriesChart({ title, seriesA, seriesB, marker = null, xLabel }: Props) {
  const { money, compact } = useFormat()
  const [asTable, setAsTable] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const length = Math.max(seriesA.values.length, seriesB.values.length)
  if (length === 0) return null

  const max = Math.max(...seriesA.values, ...seriesB.values, 1)
  const min = Math.min(...seriesA.values, ...seriesB.values, 0)
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const x = (i: number) => PAD.left + (i / Math.max(1, length - 1)) * plotW
  const y = (v: number) => PAD.top + plotH - ((v - min) / (max - min)) * plotH
  const path = (values: number[]) => values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const label = xLabel ?? ((i: number) => `mo ${i + 1}`)

  // A handful of evenly spaced rows keeps the table readable for long series.
  const step = Math.max(1, Math.round(length / 12))
  const tableRows = Array.from({ length }, (_, i) => i).filter((i) => i % step === 0 || i === length - 1)

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {!asTable && <ChartDownloadButton svgRef={svgRef} filename={`${title.toLowerCase().replace(/\s+/g, '-')}.png`} />}
          <button
            onClick={() => setAsTable((v) => !v)}
            className="no-print rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {asTable ? 'View chart' : 'View as table'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        <Legend color="var(--series-1)" label={seriesA.label} />
        <Legend color="var(--series-2)" label={seriesB.label} />
      </div>

      {asTable ? (
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="sticky top-0 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2">{seriesA.label}</th>
                <th className="px-4 py-2">{seriesB.label}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{label(i)}</td>
                  <td className="px-4 py-2 text-slate-900 dark:text-white">
                    {seriesA.values[i] === undefined ? '—' : money(seriesA.values[i])}
                  </td>
                  <td className="px-4 py-2 text-slate-900 dark:text-white">
                    {seriesB.values[i] === undefined ? '—' : money(seriesB.values[i])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label={`${title}: ${seriesA.label} versus ${seriesB.label}`}>
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

          {marker && marker.index < length && (
            <g>
              <line
                x1={x(marker.index)}
                x2={x(marker.index)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="var(--axis)"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <text x={x(marker.index) + 6} y={PAD.top + 12} fontSize={11} fill="var(--ink-muted)">
                {marker.label}
              </text>
            </g>
          )}

          <polyline points={path(seriesA.values)} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" />
          <polyline points={path(seriesB.values)} fill="none" stroke="var(--series-2)" strokeWidth={2} strokeLinejoin="round" strokeDasharray="5 3" />

          <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="var(--axis)" strokeWidth={1} />
          {[...new Set([0, Math.floor(length / 2), length - 1])].map((i) => (
            <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--ink-muted)">
              {label(i)}
            </text>
          ))}
        </svg>
        </div>
      )}
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
