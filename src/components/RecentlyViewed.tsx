import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_NAV } from '../config/navigation'
import { loadRecentlyViewed } from '../utils/recentlyViewed'

/** A quiet row of chips — only renders once there's real history to show. */
export function RecentlyViewed() {
  const [paths, setPaths] = useState<string[]>([])

  // Read after mount: the list is written by other page visits, so this
  // avoids a hydration mismatch and always reflects the latest storage.
  useEffect(() => setPaths(loadRecentlyViewed()), [])

  const items = paths.map((path) => ALL_NAV.find((item) => item.to === path)).filter((item) => item !== undefined)
  if (items.length === 0) return null

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Continue where you left off</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
