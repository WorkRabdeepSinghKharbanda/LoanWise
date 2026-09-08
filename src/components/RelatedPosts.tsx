import { Link } from 'react-router-dom'
import type { RelatedEntry } from '../utils/relatedContent'

export function RelatedPosts({ items }: { items: RelatedEntry[] }) {
  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">Related reading</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {items.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="flex flex-col gap-1 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">{r.kind}</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</span>
            <span className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{r.description}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
