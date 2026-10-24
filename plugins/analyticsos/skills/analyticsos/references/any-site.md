# Any other site

Find where the HTML `<head>` is rendered for every page: a shared layout, include or base template if there is one (Astro layout, SvelteKit `app.html`, Rails `application.html.erb`, Django `base.html`, a WordPress theme's `header.php`…), otherwise each HTML page.

## With a build that reads environment variables

Use two variables with the prefix the build needs to expose them to the page (`VITE_ANALYTICS_HOST` / `VITE_ANALYTICS_KEY` for Vite, `PUBLIC_` for Astro and SvelteKit…). Add the tags only when the key is set, so nothing loads without it.

Vite, in `index.html` (Vite replaces `%VITE_…%` at build time; render the tags conditionally in code instead if the project builds without the key):

```html
<script>
  window.aos =
    window.aos ||
    function () {
      ;(window.aos.q = window.aos.q || []).push(arguments)
    }
</script>
<script defer src="%VITE_ANALYTICS_HOST%/s/%VITE_ANALYTICS_KEY%.js"></script>
```

## Plain HTML files

Keep the values in the tags; removing the tags turns tracking off. Before the closing `</head>` on every page:

```html
<script>
  window.aos =
    window.aos ||
    function () {
      ;(window.aos.q = window.aos.q || []).push(arguments)
    }
</script>
<script defer src="https://analytics.example.com/s/prj_….js"></script>
```

## Single-page apps

Route changes (`pushState`, `popstate`, hash routes like `#/settings`) are page views already. Don't call `aos('page')` on navigation; only call it for a screen change that keeps the same URL.

## Signed-in users

See `events.md`: identify after sign-in and on load when a session exists (Identified mode only), reset on sign-out.
