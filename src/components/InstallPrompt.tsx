import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'install-prompt-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Surfaces the browser's native "add to home screen" prompt instead of
 * leaving it to fire silently — most users never notice the omnibox icon.
 * Only Chromium browsers dispatch beforeinstallprompt; everywhere else this
 * renders nothing, which is the correct behavior (no way to trigger install).
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferred(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred) return null

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDeferred(null)
  }

  const install = async () => {
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="no-print fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
        <span>Install LoanWise for quick, offline access.</span>
        <button onClick={install} className="font-semibold text-indigo-300 hover:underline dark:text-indigo-600">
          Install
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-700">
          ×
        </button>
      </div>
    </div>
  )
}
