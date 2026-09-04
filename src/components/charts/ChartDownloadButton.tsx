import { downloadChartPng } from '../../utils/exportChart'

/** Small "↓ PNG" button that rasterizes the sibling chart passed via ref. */
export function ChartDownloadButton({ svgRef, filename }: { svgRef: React.RefObject<SVGSVGElement | null>; filename: string }) {
  return (
    <button
      onClick={() => svgRef.current && downloadChartPng(svgRef.current, filename)}
      className="no-print rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      ↓ PNG
    </button>
  )
}
