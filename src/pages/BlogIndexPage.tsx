import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { BLOG_POSTS } from '../config/blog'

export function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <PageContainer>
      <Seo title="Blog" description="Short, focused reads on loan interest, APR, and the fine print that changes what a loan actually costs." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">✍️ Blog</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Short reads on the fine print that changes what a loan actually costs.</p>
        </div>

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <time dateTime={p.date} className="text-xs text-slate-400">
                {new Date(p.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </time>
              <h2 className="font-semibold text-slate-900 dark:text-white">{p.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
