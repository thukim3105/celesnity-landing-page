**Card** — the primary surface container. `surface` for everyday content, `hero` for feature/product moments (deep cosmos wash), `gradient` for a single bold highlight, `outline` for quiet grouping.

```jsx
<Card variant="hero" padding="lg">…</Card>
<Card variant="surface" interactive onClick={open}>…</Card>
```

- Radius is the brand's roomy `--radius-xl` (28px). Pass `interactive` for a clean hover lift. `hero` uses the cosmos wash; `surface`/`outline` keep a hairline for grouping.
- Adapts to `.cosmos` / `.daybreak` theme scopes.
