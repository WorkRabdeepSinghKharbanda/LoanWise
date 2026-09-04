import { useRef } from 'react'
import { useFormat } from '../../context/SettingsContext'
import { ChartDownloadButton } from './ChartDownloadButton'

interface Segment {
  label: string
  value: number
}

const W = 720
const H = 28
const GAP = 3

/**
 * Part-to-whole across several cost lines: one horizontal stacked bar plus a
 * labelled list, so every value is readable as text and not only as color.
 * Segments are drawn in the order given — sort before passing them in.
 * Rendered as SVG (not divs) so it can be exported as a PNG like every other chart.
 */
export function CostBreakdownBar({ segments, total }: { segments: Segment[]; total: number }) {
  const { money } = useFormat()
  const svgRef = useRef<SVGSVGElement>(null)
  const safeTotal = Math.max(1, total)
  // Ordered ramp: one hue, dark to light, so size and shade agree.
  const shades = ['#184f95', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#86b6ef', '#9ec5f4']
  const ordered = [...segments].sort((a, b) => b.value - a.value)

  const totalGap = GAP * Math.max(0, ordered.length - 1)
  const drawableWidth = Math.max(1, W - totalGap)

  let cursor = 0
  const bars = ordered.map((segment, i) => {
    const width = (Math.max(0, segment.value) / safeTotal) * drawableWidth
    const x = cursor
    cursor += width + GAP
    return { ...segment, x, width, color: shades[i % shades.length] }
  })

  return (
    <div className="viz rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Where the money goes</h2>
        <ChartDownloadButton svgRef={svgRef} filename="cost-breakdown.png" />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-5 h-7 w-full"
        role="img"
        aria-label={`Cost breakdown: ${ordered.map((s) => `${s.label} ${money(s.value)}`).join(', ')}`}
      >
        {bars.map((bar) => (
          <rect key={bar.label} x={bar.x} y={0} width={Math.max(0, bar.width)} height={H} rx={4} fill={bar.color}>
            <title>
              {bar.label}: {money(bar.value)}
            </title>
          </rect>
        ))}
      </svg>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((segment, i) => (
          <li key={segment.label} className="flex items-center gap-2.5">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: shades[i % shades.length] }} />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {segment.label} · {((Math.max(0, segment.value) / safeTotal) * 100).toFixed(0)}%
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{money(segment.value)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
