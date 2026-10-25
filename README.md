# analyticsOS agent skills

Skills that teach coding agents (Claude Code, Cursor, Copilot, Codex…) to add [analyticsOS](https://github.com/WorkOfNeo/analyticsos) tracking to an app: the script in the right place for the stack, signed-in users, custom events, named sections, and keeping personal data out. Then they build the app's dashboard through the analyticsOS MCP server (`{host}/api/mcp`, with a key from Settings → API keys).

The quickest start is the prompt on analyticsOS's New app page. It looks like this:

```text
Install the analyticsOS skill from github.com/WorkOfNeo/analyticsos-skills and use it to add analyticsOS tracking to this app. Once events arrive, build its dashboard in analyticsOS too: the skill says how.

App: NEO Ledger (Identified mode)
App id: cm…
Host: https://analytics.example.com
Key: prj_…
```

## Install

Claude Code, from the shell:

```bash
claude plugin install analyticsos --marketplace WorkOfNeo/analyticsos-skills
```

Claude Code, in a session:

```text
/plugin marketplace add WorkOfNeo/analyticsos-skills
/plugin install analyticsos@analyticsos-skills
```

Other agents, with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add WorkOfNeo/analyticsos-skills --skill analyticsos
```

By hand: copy `plugins/analyticsos/skills/analyticsos` into your project's `.claude/skills/` (or `~/.claude/skills/` for every project).

## What's inside

```text
.claude-plugin/marketplace.json        the marketplace: one plugin
plugins/analyticsos/
  .claude-plugin/plugin.json           the plugin
  skills/analyticsos/
    SKILL.md                           install steps, privacy rules, troubleshooting
    references/nextjs.md               Next.js (App and Pages Router)
    references/flask.md                Flask and other server-rendered apps
    references/webflow.md              Webflow, by hand or through its MCP server
    references/any-site.md             plain HTML, Vite, Astro, SvelteKit, Rails, Django…
    references/events.md               identify, custom events, named clicks, sections
```

## License

MIT
