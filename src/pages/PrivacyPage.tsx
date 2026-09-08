import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'

export function PrivacyPage() {
  return (
    <PageContainer>
      <Seo title="Privacy Policy" description="What LoanWise stores, what it doesn't, and how ads (when enabled) use cookies." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🔒 Privacy Policy</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Last updated {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <section>
            <h2 className="font-semibold text-slate-900 dark:text-white">What this site processes</h2>
            <p className="mt-1">
              Every calculation runs entirely in your browser — loan amounts, rates, terms, and every other number you
              enter never leave your device and are never sent to a server. There is no backend and no account. This
              site does use Google Analytics to see which pages get visited (see "Analytics" below), but calculator
              inputs are never part of that — they stay local to the calculation itself.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 dark:text-white">What's stored locally</h2>
            <p className="mt-1">
              This site uses your browser's <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">localStorage</code>{' '}
              to remember things between visits — your currency and language, light/dark theme, saved scenarios and
              notes, recently viewed calculators, comparison scenarios, and your choice on this cookie banner. None of
              it is uploaded anywhere; clearing your browser's site data removes all of it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 dark:text-white">Analytics</h2>
            <p className="mt-1">
              This site uses Google Analytics to see aggregate traffic — which pages get visited, roughly how many
              people, which browsers and devices — using cookies of its own. It never sees what you type into a
              calculator. You can opt out of Google Analytics tracking across sites using the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Google Analytics opt-out browser add-on
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 dark:text-white">Advertising</h2>
            <p className="mt-1">
              If ads are enabled on this site, they're served through Google AdSense, which may use cookies to show
              ads based on your visits here and to other sites. You can opt out of personalized advertising, or see
              which companies are involved, at{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                adssettings.google.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 dark:text-white">Contact</h2>
            <p className="mt-1">Questions about this policy can be raised via this project's GitHub repository.</p>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
