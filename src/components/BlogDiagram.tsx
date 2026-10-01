import { useRef } from 'react'
import { ChartDownloadButton } from './charts/ChartDownloadButton'
import type { BlogDiagramSpec } from '../config/blog'

/**
 * A single reusable illustration for blog posts — original inline SVG, not a
 * stock photo, so there's no licensing question and it matches the site's
 * existing chart convention (inline SVG, --series-1/2 roles, PNG export).
 * Two shapes cover most post topics: 'bars' for a static comparison (rates,
 * fees, costs), 'curve' for two values changing over time (balance,
 * payment split). Data is illustrative, not computed from a live calculator.
 */

const W = 640
const H = 220
const PAD = 36

function formatValue(v: number, unit: 'currency' | 'percent' | 'count', suffix?: string) {
  if (unit === 'percent') return `${v}%`
  if (unit === 'count') return suffix ? `${v} ${suffix}` : `${v}`
  return `$${v.toLocaleString()}`
}

function Bars({ spec, svgRef }: { spec: Extract<BlogDiagramSpec, { kind: 'bars' }>; svgRef: React.RefObject<SVGSVGElement | null> }) {
  const max = Math.max(...spec.bars.map((b) => b.value), 1)
  const barGap = 24
  const barWidth = (W - PAD * 2 - barGap * (spec.bars.length - 1)) / spec.bars.length
  const chartH = H - PAD * 2

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={spec.caption}>
      {spec.bars.map((bar, i) => {
        const barH = (bar.value / max) * chartH
        const x = PAD + i * (barWidth + barGap)
        const y = H - PAD - barH
        return (
          <g key={bar.label}>
            <rect x={x} y={y} width={barWidth} height={barH} rx={6} fill={`var(--series-${bar.role})`}>
              <title>{`${bar.label}: ${formatValue(bar.value, spec.unit, spec.suffix)}`}</title>
            </rect>
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold dark:fill-slate-200">
              {formatValue(bar.value, spec.unit, spec.suffix)}
            </text>
            <text x={x + barWidth / 2} y={H - PAD + 18} textAnchor="middle" className="fill-slate-500 text-[12px] dark:fill-slate-400">
              {bar.label}
            </text>
          </g>
        )
      })}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
    </svg>
  )
}

function Curve({ spec, svgRef }: { spec: Extract<BlogDiagramSpec, { kind: 'curve' }>; svgRef: React.RefObject<SVGSVGElement | null> }) {
  const allPoints = spec.series.flatMap((s) => s.points)
  const max = Math.max(...allPoints, 1)
  const chartW = W - PAD * 2
  const chartH = H - PAD * 2
  const n = spec.xLabels.length

  const toPath = (points: number[]) =>
    points
      .map((v, i) => {
        const x = PAD + (i / (n - 1)) * chartW
        const y = H - PAD - (v / max) * chartH
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={spec.caption}>
      {spec.series.map((s) => (
        <path key={s.label} d={toPath(s.points)} fill="none" stroke={`var(--series-${s.role})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {spec.xLabels.map((label, i) => {
        const x = PAD + (i / (n - 1)) * chartW
        return (
          <text key={label} x={x} y={H - PAD + 18} textAnchor="middle" className="fill-slate-500 text-[12px] dark:fill-slate-400">
            {label}
          </text>
        )
      })}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
    </svg>
  )
}

export function BlogDiagram({ spec }: { spec: BlogDiagramSpec }) {
  const svgRef = useRef<SVGSVGElement>(null)

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{spec.title}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{spec.caption}</p>
        </div>
        <ChartDownloadButton svgRef={svgRef} filename="diagram.png" />
      </div>

      <div className="mt-4 h-56">
        {spec.kind === 'bars' ? <Bars spec={spec} svgRef={svgRef} /> : <Curve spec={spec} svgRef={svgRef} />}
      </div>

      {spec.kind === 'curve' && (
        <div className="mt-4 flex flex-wrap gap-4">
          {spec.series.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: `var(--series-${s.role})` }} />
              <span className="text-xs text-slate-600 dark:text-slate-300">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
