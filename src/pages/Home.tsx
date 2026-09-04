import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { AdSlot } from '../components/AdSlot'
import { RecentlyViewed } from '../components/RecentlyViewed'
import { useT } from '../context/SettingsContext'
import { NAV_GROUPS, ALL_NAV } from '../config/navigation'
import type { NavItem } from '../config/navigation'

const FEATURES = [
  { icon: '🔒', title: 'Nothing leaves your browser', desc: 'Every figure is computed locally. No accounts, no uploads, no tracking of your finances.' },
  { icon: '📅', title: 'Real amortization schedules', desc: 'The principal/interest split for every month, with calendar dates, exportable to CSV or PDF.' },
  { icon: '💸', title: 'Prepayment modelling', desc: 'Extra monthly, a lump sum, an annual bonus, the biweekly trick — see the interest and years it removes.' },
  { icon: '🧾', title: 'APR, not just the rate', desc: 'Fold in origination fees and points to compare offers on the number that actually matters.' },
  { icon: '🔗', title: 'Shareable links', desc: 'Your inputs live in the URL, so a scenario can be sent to a partner or broker exactly as you left it.' },
  { icon: '📶', title: 'Works offline', desc: 'Install it and every calculator keeps working with no connection at all.' },
]

const TESTIMONIALS = [
  { quote: 'The prepayment view made it obvious that £200 a month cuts four years off our mortgage. No bank site showed me that.', name: 'Priya M.', role: 'first-time buyer' },
  { quote: 'I compared three car finance offers in a minute. The lowest monthly payment turned out to be the most expensive overall.', name: 'Daniel O.', role: 'compared 3 offers' },
  { quote: 'Rent vs buy told me to keep renting for two more years. Genuinely useful, and not trying to sell me anything.', name: 'Sara K.', role: 'renting for now' },
]

export function Home() {
  const t = useT()
  return (
    <div>
      <Seo
        title="Loan, Mortgage & EMI Calculators"
        description="24 free loan calculators — mortgage, EMI, car, credit card, student loan, refinance, affordability, rent vs buy — with full amortization schedules."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-0 h-72 w-[28rem] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-700/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            {ALL_NAV.length} {t('heroTag')}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            {t('heroTitlePrefix')}{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              {t('heroTitleHighlight')}
            </span>{' '}
            {t('heroTitleSuffix')}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">{t('heroSubtitle')}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/quiz"
              className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              {t('ctaQuiz')}
            </Link>
            <Link
              to="/mortgage"
              className="rounded-xl border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {t('ctaMortgage')}
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Tip: press{' '}
            <kbd className="rounded border border-slate-300 px-1.5 py-0.5 font-sans dark:border-slate-600">⌘K</kbd> to jump
            to any calculator
          </p>

          <div className="mt-14 grid gap-6 border-t border-slate-200/70 pt-8 sm:grid-cols-3 dark:border-slate-800">
            <HeroStat value={`${ALL_NAV.length}`} label="calculators" />
            <HeroStat value="0" label="data sent anywhere" />
            <HeroStat value="360+" label="months of schedule detail" />
          </div>
        </div>
      </section>

      <RecentlyViewed />

      <div className="mx-auto max-w-5xl px-6 pt-10">
        <AdSlot name="homeTop" />
      </div>

      {/* Calculator groups */}
      {NAV_GROUPS.map((group, i) => (
        <section
          key={group.title}
          className={i % 2 === 1 ? 'border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40' : ''}
        >
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{group.title}</h2>
              <span className="text-sm text-slate-400">{group.items.length} tools</span>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Card key={item.to} item={item} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Built to be actually useful
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-500 dark:text-slate-400">
            Not a lead-generation form with a number attached to it.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-950">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            What people work out here
          </h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900"
              >
                <blockquote className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">"{t.quote}"</blockquote>
                <figcaption className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{t.name}</span> · {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Not sure which one you need?</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
          Two questions and we'll point you straight at the right calculator.
        </p>
        <Link
          to="/quiz"
          className="mt-8 inline-block rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Take the 20-second quiz →
        </Link>
      </section>
    </div>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

function Card({ item }: { item: NavItem }) {
  return (
    <Link
      to={item.to}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 transition group-hover:opacity-100"
      />
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-950">{item.icon}</div>
      <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{item.label}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
      <span className="mt-4 text-sm font-medium text-indigo-600 transition group-hover:translate-x-0.5 dark:text-indigo-400">
        Open →
      </span>
    </Link>
  )
}
