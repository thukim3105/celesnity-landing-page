**StatBlock** — the app's signature readout: a large Inter value over a muted label. Use for metrics like *98% clear*, *12 visible planets*, *02:14*.

```jsx
<StatBlock value="98% clear" label="Tonight's sky" size="lg" bare />
<StatBlock value="12" label="visible planets" />
<StatBlock value="17°" label="horizon temp" accent />
```

Use `bare` when nesting inside a hero `Card`; `accent` tints the number cobalt. Add `onDark` when the StatBlock sits directly on the always-dark cosmos/gradient wash (hero cards, login) so it stays legible in Daybreak mode.
