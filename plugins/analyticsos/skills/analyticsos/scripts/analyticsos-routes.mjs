// Sends this app's page routes to analyticsOS after a build, so its page inventory knows the
// pages behind a sign-in too, visited or not. Next.js: it reads the route lists `next build`
// writes. It never fails the build: a problem is printed, never thrown.
//
// Needs ANALYTICS_HOST and ANALYTICS_KEY (or their NEXT_PUBLIC_ versions), and
// ANALYTICSOS_API_KEY: an API key with "Read and build dashboards" (analyticsOS → Settings →
// API keys), kept in the host's variables, never in the repository. Without them it does nothing.
//
// Usage: node scripts/analyticsos-routes.mjs [build folder, default .next]
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const env = process.env
const host = (env.ANALYTICS_HOST ?? env.NEXT_PUBLIC_ANALYTICS_HOST ?? '').replace(/\/+$/, '')
const app = env.ANALYTICS_KEY ?? env.NEXT_PUBLIC_ANALYTICS_KEY
const apiKey = env.ANALYTICSOS_API_KEY
const dist = process.argv[2] ?? '.next'

function read(file) {
  try {
    return JSON.parse(readFileSync(join(dist, file), 'utf8'))
  } catch {
    return {}
  }
}

async function main() {
  if (!host || !app || !apiKey) {
    console.log(
      'analyticsOS routes: skipped (set ANALYTICS_HOST, ANALYTICS_KEY and ANALYTICSOS_API_KEY to send them)',
    )
    return
  }
  // App Router: "/clients/[id]/page" → "/clients/[id]". Route handlers (…/route) aren't pages.
  const appRoutes = Object.entries(read('app-path-routes-manifest.json'))
    .filter(([file]) => file.endsWith('/page'))
    .map(([, route]) => route)
  // Pages Router: every page but Next's own (_app, _document, _error, 404, 500) and API routes.
  const pageRoutes = Object.keys(read('server/pages-manifest.json')).filter(
    (route) => !/^\/(_|api(\/|$)|404$|500$)/.test(route),
  )
  const routes = [...new Set([...appRoutes, ...pageRoutes])].sort()
  if (!routes.length) {
    console.log(`analyticsOS routes: skipped (no routes found in ${dist})`)
    return
  }
  const version =
    env.RAILWAY_GIT_COMMIT_SHA ?? env.VERCEL_GIT_COMMIT_SHA ?? env.GITHUB_SHA ?? env.COMMIT_SHA
  const res = await fetch(`${host}/api/routes`, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ app, routes, version }),
    signal: AbortSignal.timeout(10_000),
  })
  const answer = await res.json().catch(() => ({}))
  if (!answer.ok) {
    console.log(`analyticsOS routes: not sent (${res.status}: ${answer.error ?? 'no answer'})`)
  } else if (answer.held) {
    console.log(
      `analyticsOS routes: ${answer.routes} sent, but held: it would remove ${answer.removed} at once. If that is right, use it in analyticsOS (the app's Pages on the site).`,
    )
  } else {
    console.log(
      `analyticsOS routes: ${answer.routes} sent (${answer.added} new, ${answer.removed} gone)`,
    )
  }
}

main()
  .catch((error) => console.log(`analyticsOS routes: not sent (${error.message})`))
  .finally(() => process.exit(0))
