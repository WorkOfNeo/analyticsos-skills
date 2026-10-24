# Signed-in users, custom events and named clicks

All calls go through `window.aos(…)`. Calls made before the script loads are queued and sent once it does, so they are safe anywhere after the first tag.

| Call                               | What it does                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `aos('identify', userId, traits?)` | Identified mode: links this visitor to `userId`. Ignored in Anonymous mode.                         |
| `aos('reset')`                     | Sign-out: forgets the user and starts a new visitor.                                                |
| `aos('track', name, props?)`       | A custom event.                                                                                     |
| `aos('page')`                      | A page view now. Only for a screen change that keeps the same URL; navigations are tracked already. |

## identify

```js
window.aos('identify', user.id, { role: user.role, plan: user.plan })
```

- Call it after sign-in, and on page load when a session already exists.
- `userId`: the app's internal id (a database id or UUID). **Never** an email, a name or a phone number.
- Traits: a few non-sensitive strings, numbers or booleans that help group people: role, plan, team size, signup cohort. Never anything a person typed, and nothing personal.
- On sign-out: `window.aos('reset')`.
- Anonymous mode: don't add identify at all.

## Custom events

Only for business moments the script can't see as a click or a page view: `quotation_sent`, `plan_upgraded`, `invoice_paid`, `export_finished`.

```js
window.aos('track', 'quotation_sent', { lines: 3, currency: 'DKK' })
```

- Names: `snake_case`, object then verb in the past tense (`report_exported`), stable over time. Reports group by name, so don't put ids or dates in it.
- Props: a handful of short values for breaking the event down. Never personal data, free text or ids that identify a person.
- Prefer the server's moment of truth: send it after the action succeeded, not when the button was pressed.

## AI answers and Langfuse

When the app uses Langfuse and its analyticsOS app is linked to the Langfuse project, the two are joined by person and by answer:

- On every trace, set Langfuse's `userId` to the same internal id the page passes to `aos('identify', …)` (`propagateAttributes({ userId })` in the JS SDK, `propagate_attributes(user_id=…)` in Python). Never the email.
- Where a person sees what the AI made, have the API return the trace id (32 lowercase hex characters; `getActiveTraceId()` in the JS SDK) and send it when the result is shown:

```js
window.aos('track', 'answer_shown', { trace_id: traceId })
```

- The event's name is yours (`summary_shown`, `reply_shown`); the `trace_id` prop is what links it. analyticsOS can then score what people did next on that trace in Langfuse (copied it, asked again, rage-clicked, left).

## Named clicks

Clicks are captured already. To give one a stable name in reports without code, add an attribute:

```html
<button data-aos-event="start_trial">Start your free trial</button>
```

Elements without a click handler, like a card made clickable by a parent, can carry it too: anything with `data-aos-event` counts as a click target.

## Sections and private elements

- `data-section="Pricing"` on the main blocks of a page names where clicks and scrolls happen. Without it the nearest `section`, `header`, `footer`, `nav`, `main`, `aside` or `article` is used, labelled by its `aria-label`, `id` or first heading.
- `data-private` on anything that shows personal data: its text is never read, and page snapshots blank it.
- `data-analytics-ignore` on a region whose clicks and forms should not be captured at all (an admin toolbar, a cookie banner).
