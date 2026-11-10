import posthog from 'posthog-js'

// Visitor analytics (PostHog). Every page view, page leave (time on page +
// scroll depth), click and session replay of the public site is captured.
// This module is the only place that talks to the PostHog SDK.
//
//   VITE_POSTHOG_KEY   — public project token (phc_…), safe in the bundle
//   VITE_POSTHOG_HOST  — ingestion host, defaults to the US cloud
const POSTHOG_KEY = (import.meta.env.VITE_POSTHOG_KEY as string) || ''
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string) || 'https://us.i.posthog.com'

// The owner's own admin work must not pollute the visitor stats.
const PRIVATE_PATH_PREFIX = '/admin'

const isPrivatePage = () => window.location.pathname.startsWith(PRIVATE_PATH_PREFIX)

// The build-time prerenderer drives the app in headless Chrome: those visits
// are not real users, and the SDK's injected scripts must not end up in the
// prerendered HTML.
const isAutomatedBrowser = () => navigator.webdriver

export function initAnalytics() {
  if (!POSTHOG_KEY || isAutomatedBrowser()) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // SPA-aware defaults: a $pageview on every router navigation (history
    // change) and a $pageleave with time spent and max scroll depth.
    defaults: '2026-01-30',
    person_profiles: 'always',
    session_recording: { maskAllInputs: true },
    before_send: (event) => (isPrivatePage() ? null : event),
  })
}
