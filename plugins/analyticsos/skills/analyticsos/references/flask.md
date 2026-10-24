# Flask (and other Jinja apps)

## Environment

```bash
# .env (and the host's environment settings)
ANALYTICS_HOST=https://analytics.example.com
ANALYTICS_KEY=prj_…
```

Load them into the app config where the app is created, the way the project already reads its settings:

```python
app.config['ANALYTICS_HOST'] = os.getenv('ANALYTICS_HOST')
app.config['ANALYTICS_KEY'] = os.getenv('ANALYTICS_KEY')
```

## The tags

In the base template every page extends, inside `<head>`:

```jinja
{% if config.ANALYTICS_KEY %}
<script>window.aos=window.aos||function(){(window.aos.q=window.aos.q||[]).push(arguments)}</script>
<script defer src="{{ config.ANALYTICS_HOST }}/s/{{ config.ANALYTICS_KEY }}.js"></script>
{% endif %}
```

With no key set nothing loads: that is the off switch.

## Signed-in users (Identified mode)

In the base template, when someone is signed in (Flask-Login shown; use whatever the project has):

```jinja
{% if config.ANALYTICS_KEY and current_user.is_authenticated %}
<script>window.aos('identify', {{ current_user.id | string | tojson }}, { role: {{ current_user.role | tojson }} })</script>
{% endif %}
```

On the sign-out page, or in the sign-out handler's response, call `window.aos('reset')`. See `events.md` for what may go in traits.

The same pattern fits Django templates, Rails layouts and other server-rendered apps: a guarded block in the shared layout's `<head>`.
