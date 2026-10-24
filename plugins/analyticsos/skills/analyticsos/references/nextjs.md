# Next.js

## Environment

```bash
# .env (and the host's environment settings)
NEXT_PUBLIC_ANALYTICS_HOST=https://analytics.example.com
NEXT_PUBLIC_ANALYTICS_KEY=prj_…
```

Add both names with empty values to `.env.example`.

## The tags

Put this in the **root** layout so it is on every page: `app/layout.tsx` inside `<body>` (App Router) or `pages/_app.tsx` (Pages Router).

```tsx
import Script from 'next/script'

{
  process.env.NEXT_PUBLIC_ANALYTICS_KEY && (
    <>
      <Script id="aos-stub" strategy="afterInteractive">
        {`window.aos=window.aos||function(){(window.aos.q=window.aos.q||[]).push(arguments)}`}
      </Script>
      <Script
        src={`${process.env.NEXT_PUBLIC_ANALYTICS_HOST}/s/${process.env.NEXT_PUBLIC_ANALYTICS_KEY}.js`}
        strategy="afterInteractive"
      />
    </>
  )
}
```

- Use `next/script` with `strategy="afterInteractive"` for both, the first one inline with an `id`. **Never a plain `<script>`**: React does not run a script tag it adds during a client-side navigation, so a plain tag in a nested layout (a signed-in area, say) silently sends nothing.
- With no key set, nothing renders: that is the off switch.
- Client-side navigations are page views already; don't call `aos('page')` on route changes.

## Signed-in users (Identified mode)

Call identify where the client knows the user: a client component under the signed-in layout that runs when the session is there, after login and on load when a session already exists.

```tsx
'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    aos?: (...args: unknown[]) => void
  }
}

export function Identify({ userId, role }: { userId: string; role: string }) {
  useEffect(() => {
    window.aos?.('identify', userId, { role })
  }, [userId, role])
  return null
}
```

On sign-out call `window.aos?.('reset')` before or right after the session ends. See `events.md` for what may go in traits.

## Content-Security-Policy

If `next.config` or middleware sets a CSP, add the host to `script-src` and `connect-src`.
