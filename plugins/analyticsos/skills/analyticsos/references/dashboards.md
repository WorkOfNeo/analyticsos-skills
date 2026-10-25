# Build the app's dashboard

Once tracking works (the setup page has ticked off the first page view), build the app's dashboard in analyticsOS through its MCP server. You know the codebase, so you know what matters in it: use that to choose what to show. The person can also ask for this on its own later ("add the checkout funnel to the dashboard").

## Connect, once

If the analyticsOS tools (`list_apps`, `get_dashboard`, `add_widget`…) are already there, skip this.

1. Ask the person for an API key with **Read and build dashboards** access: analyticsOS → Settings → API keys. It is a secret: never write it into the project, its `.env`, or any file in the repository.
2. Connect it (they can paste the same command from the API keys page):

   ```bash
   claude mcp add --transport http --scope user analyticsos {HOST}/api/mcp --header "Authorization: Bearer {KEY}"
   ```

3. New MCP servers load when Claude Code starts: ask them to restart it (or check `/mcp`), then carry on.

- **401**: the key is wrong or was revoked.
- **"This key only reads"**: it was made with Read access. Ask for one with Read and build dashboards.

## Build

The server's instructions describe queries and widgets in full; follow them. In short:

1. **Find the app and its dashboard.** `list_apps` (match the app id from the setup prompt, or the name), then `list_dashboards`: every app starts with a dashboard of the basics that shows only that app. Change that one. Make another (`create_dashboard`, `apps: [appId]`) only when asked.
2. **Read it** with `get_dashboard` for its tab and widget ids, and don't remove widgets the person made unless they ask.
3. **See what arrives**: `run_query` with `measure: "count"`, `breakdown: "event"` and the app id in `apps`. Right after install there is little data. Widgets for events the code you wrote sends are fine: they fill as people use the app. Say so.
4. **Choose from the code**, a few widgets that answer real questions rather than many:
   - each custom event you added with `aos('track', …)` that matters: a number or a line over time;
   - sign-up, checkout or onboarding steps: `create_funnel` with those steps, then a funnel widget;
   - the key routes: page views of those pages, and a page snapshot widget for the most important one;
   - the sections you named with `data-section`: how far people get;
   - errors (`error`, `request_failed`) and speed (Web Vitals);
   - Identified apps: signed-in users per day, and retention.

   Group them on tabs, such as Overview, Funnels and Quality.

5. **Every change is saved at once** as a version of the dashboard; `restore_version` takes one back.
6. **Finish**: list what you added and give the dashboard's url from the tool results.

To list the site’s pages that nobody visits: `list_inventory` with `filter: "never"` (`rescan_pages` scans again first).
