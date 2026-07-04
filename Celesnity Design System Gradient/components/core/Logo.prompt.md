**Logo** — the Celesnity identity: an orbiting star mark paired with the Inter-bold wordmark. Reach for it in headers, splash screens, and auth views.

```jsx
<Logo tone="dark" size={32} assetBase="../../" />      // white mark on cosmos
<Logo variant="mark" tone="light" size={40} />          // mark only, ink
<Logo variant="wordmark" tone="light" />
```

- `tone="dark"` uses the reversed white mark (place on cosmic/dark backgrounds); `tone="light"` uses the ink mark.
- Set `assetBase` to the relative path that reaches `/assets` from the file rendering the logo.
- Clearspace = ¼ of the mark height on all sides.
