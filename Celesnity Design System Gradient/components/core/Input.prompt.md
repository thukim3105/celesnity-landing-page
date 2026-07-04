**Input** — single-line text field with optional label, leading icon, and hint/error. Cobalt focus ring; magenta on error.

```jsx
<Input label="Email" placeholder="you@stars.io" iconLeft={<MailIcon/>} />
<Input label="City" error="We couldn't find that place" />
```

Controlled (`value`/`onChange`) or uncontrolled (`defaultValue`).
