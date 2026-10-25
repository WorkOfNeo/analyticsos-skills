# Send the app's routes

analyticsOS finds an app's public pages by crawling them and its other pages from what people visit, but it can't sign in. The app's own list of its routes lets its page inventory show every page, including the ones behind a sign-in that nobody opens. Only route patterns are sent, like `/clients/[id]`: never content, never data.

Each list replaces the one before. A route the new list drops is marked gone, a new one is added, and page views count per route (visits to `/clients/acme` count for `/clients/[id]`). A list that is empty, or would remove more than half the routes at once, waits until the next deploy sends the same list or someone confirms it in analyticsOS.

## Next.js

1. Copy `scripts/analyticsos-routes.mjs` from this skill into the project's `scripts/` folder, unchanged.
2. Run it after the build, in the app's `package.json`:

   ```json
   "build": "next build && node scripts/analyticsos-routes.mjs"
   ```

   Keep whatever the build script already does before `next build`. If `next.config` sets `distDir`, pass that folder: `node scripts/analyticsos-routes.mjs build`. It reads the route lists Next writes there (`app-path-routes-manifest.json` for the App Router, `server/pages-manifest.json` for the Pages Router).

3. **The key:** it needs `ANALYTICSOS_API_KEY`, an API key with **Read and build dashboards** from analyticsOS → Settings → API keys. It is a secret, unlike the app's `prj_` key. Ask the person for it, tell them to set it in their host's variables (Railway → Variables…) for the builds that should send routes, and add the name with an empty value to `.env.example`. Never write the key itself into the project. The host and the app key are the ones the install already set (`ANALYTICS_HOST` and `ANALYTICS_KEY`, or their `NEXT_PUBLIC_` versions).
4. **It never fails the build.** Without the key it prints `analyticsOS routes: skipped` and the build goes on. A wrong key or an unreachable host is printed too, and gives up after 10 seconds.
5. **Check:** build locally with the three variables set. It prints `analyticsOS routes: 42 sent (42 new, 0 gone)`, and the app's Pages on the site in analyticsOS lists the routes.

## Other frameworks

There is no route list to read after the build, so send it yourself:

- **Once, now:** read the routes from the code (React Router's route objects, SvelteKit's `src/routes`, `rails routes`, Django's `urlpatterns`…) and send them with the MCP server's `set_routes` tool: `{ "appId": "…", "routes": ["/", "/clients", "/clients/:id"] }`. Use `:name` for a dynamic segment and `:name*` for the rest of the path. Send the whole list again whenever routes change.
- **On every deploy:** write a small script like `analyticsos-routes.mjs` for the build that collects the same list and posts it: `POST {ANALYTICS_HOST}/api/routes` with `Authorization: Bearer {ANALYTICSOS_API_KEY}` and `{ "app": "{ANALYTICS_KEY}", "routes": […], "version": "<commit>" }`. It must never fail the build.

Leave out API routes, files (`/robots.txt`, `/sitemap.xml`, images) and redirects: only pages people open.
