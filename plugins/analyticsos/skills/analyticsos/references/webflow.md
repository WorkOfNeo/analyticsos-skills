# Webflow

Webflow has no environment variables, so the key sits in the snippet. Custom code needs a paid Site plan or Workspace plan.

## By hand (tell the person)

1. Site settings → Custom code → Head code: paste

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

2. Save, then publish. Custom code runs on the published site, not in the Designer.
3. Add both addresses, `<site>.webflow.io` and the custom domain, to Allowed domains in the app's settings in analyticsOS. Once that list has a domain, events from any other address are refused.
4. To name a section or keep an element's text out: select it, Element settings → Custom attributes, add `data-section` (e.g. `Pricing`) or `data-private` = `true`.

## With Webflow's MCP server or Data API

Register this as **inline** site custom code (display name `analyticsOS`, version `1.0.0`), passed exactly as it is, without `<script>` tags (Webflow adds them):

```js
window.aos =
  window.aos ||
  function () {
    ;(window.aos.q = window.aos.q || []).push(arguments)
  }
;(function (d) {
  var s = d.createElement('script')
  s.defer = true
  s.src = 'https://analytics.example.com/s/prj_….js'
  d.head.appendChild(s)
})(document)
```

- Inline, not hosted: a hosted script needs an integrity hash, and the script file changes whenever the tracker or the app's settings change. Inline scripts are limited to 2,000 characters; this one is far under.
- Apply it to the whole site, in the header. Applying replaces the site's list of scripts: read the scripts already applied and keep them in the list.
- Publishing puts every other unpublished change live too, so ask the person before publishing. Then read the applied scripts back and confirm analyticsOS is there.
- If the tools can't register or apply custom code, give the person the manual steps above.
