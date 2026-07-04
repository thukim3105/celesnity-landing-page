**Button** — the brand's primary call to action; use `primary` for the single most important action on a view, `secondary`/`ghost` for supporting actions.

```jsx
<Button variant="primary" size="lg" iconRight={<ArrowIcon/>}>Start stargazing</Button>
<Button variant="secondary">Learn more</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

- Variants: `primary` (nebula gradient fill), `accent` (solid cobalt), `secondary` (tinted glass surface), `ghost` (text-only).
- Sizes: `sm` · `md` · `lg`. Pass `fullWidth` for stacked mobile CTAs.
- Adapts automatically to `.cosmos` (dark) and `.daybreak` (light) theme scopes.
