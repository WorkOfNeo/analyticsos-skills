---
name: analyticsos
description: Add analyticsOS tracking to a web app or website, or extend it - identify signed-in users, send custom events, name page sections, keep personal data out - and build the app's analyticsOS dashboard through its MCP server. Use when asked to install analyticsOS, add analytics or event tracking with an analyticsOS key (prj_...), work with the aos() calls in a project, or build or change an analyticsOS dashboard.
license: MIT
---

# analyticsOS tracking

analyticsOS records page views, clicks, scrolls, forms, errors, speed and signed-in users through one script per app. Installing it is two tags in the page's `<head>`; most of the work is putting them in the right place for the stack, and keeping personal data out.

## What you need from the person

The analyticsOS setup page gives them a prompt with these values (and the app's id, for its dashboard). Ask for any that are missing; never guess them.

- **Host**: where their analyticsOS runs, e.g. `https://analytics.example.com`.
- **Key**: the app's public key, `prj_…`. It is not a secret: it ends up in every page that loads the script.
- **Mode**: `Identified` (apps with logins, consent in their agreement) or `Anonymous` (public sites, nothing stored on the device).

## Install

1. **Find the stack** and read its reference before changing anything:
   - Next.js (App Router or Pages Router): `references/nextjs.md`
   - Flask or another Jinja app: `references/flask.md`
   - Webflow: `references/webflow.md`
   - Anything else (plain HTML, Vite, Astro, SvelteKit, Rails, Django, PHP, WordPress…): `references/any-site.md`
2. **Environment variables, not hard-coded values**: `ANALYTICS_HOST` and `ANALYTICS_KEY`, with whatever prefix the build needs to expose them to the page (`NEXT_PUBLIC_` for Next.js, `VITE_` for Vite). Put them in the local `.env`, add the names with empty values to `.env.example`, and tell the person to set them in their host's settings (Railway → Variables, Vercel → Environment Variables…) for each environment where tracking should run.
3. **The two tags, in `<head>` on every page, only when the key is set.** With no key nothing must load: that is the off switch for local development and previews.

   ```html
   <script>
     window.aos =
       window.aos ||
       function () {
         ;(window.aos.q = window.aos.q || []).push(arguments)
       }
   </script>
   <script defer src="{ANALYTICS_HOST}/s/{ANALYTICS_KEY}.js"></script>
   ```

   The first tag queues calls made before the script loads; the second loads the script with the app's settings.

4. **Signed-in users** (Identified mode only): see `references/events.md`. In Anonymous mode add no identify calls and store nothing about the visitor.
5. **Name the main sections** of key pages with `data-section="Pricing"` (hero, pricing, sign-up form…) so reports can name them, and put `data-private` on any element whose text must never be read: customer names, amounts, addresses, anything personal.
6. **Content-Security-Policy**: if the project sets one, allow the host in `script-src` and `connect-src`.
7. **Nothing else**: don't add other analytics, cookies or consent banners. analyticsOS needs none of them.
8. **Finish**: run the project's build and linter, list the files you changed, and tell the person to open the app in a browser. The setup page in analyticsOS ticks off the first page view within seconds.
9. **Dashboard**: once events arrive, build the app's dashboard in analyticsOS from what you now know about the code: `references/dashboards.md`.

## What the script already captures

Don't write code for any of these; they come with the script:

- page views, including client-side navigations in single-page apps;
- clicks on links, buttons and anything with `data-aos-event`, plus outbound links, downloads, rage clicks and dead clicks;
- scroll depth and time on page;
- forms started, submitted and abandoned (never what was typed);
- Core Web Vitals (LCP, INP, CLS, FCP, TTFB), JavaScript errors and failed same-origin requests.

Custom events, named clicks, identify and linking AI answers to Langfuse traces are in `references/events.md`.

## Privacy rules

These hold in every project, whatever the person asks:

- Never send an email address, name, phone number or anything a person typed: not in `identify` traits, not in `track` props, not in `data-aos-event` names.
- Identify with the app's internal user id, never the email.
- Mark elements that show personal data with `data-private`. The script also never reads inputs, textareas or `contenteditable`.
- Browsers sending Do Not Track or Global Privacy Control are not tracked at all, and `aos()` calls are dropped. Don't work around it.

## When nothing arrives

Open the app with the browser's network tab:

- `/s/{key}.js` should load (200), then requests to `{host}/api/e` answer 204.
- **403** from `/api/e`: the page's domain is not in the app's Allowed domains (analyticsOS → the app's settings). Add it, or leave the list empty while testing.
- **404**: the key is wrong or was rotated more than 24 hours ago.
- **No requests at all**: the key variable isn't set in that environment, a Content-Security-Policy blocks the host, or the browser sends Do Not Track / Global Privacy Control.
- **Next.js, events stop after the first page**: the tags were added as plain `<script>` elements in a nested layout. Use `next/script` in the root layout (see `references/nextjs.md`).
