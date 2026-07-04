import React from 'react';

/**
 * Celesnity Logo — the orbit-and-spark mark with optional wordmark.
 * The mark is a PNG asset served with the design system; `tone` picks
 * the ink mark (for light surfaces) or the reversed white mark (for
 * cosmic surfaces).
 */
export function Logo({
  variant = 'lockup',      // 'lockup' | 'mark' | 'wordmark'
  tone = 'auto',           // 'auto' | 'light' | 'dark'  (dark = white mark on cosmos)
  size = 32,
  assetBase = '',          // path prefix to /assets, e.g. "../.." from a card
  style = {},
  ...rest
}) {
  // tone=dark → white reversed mark (use on cosmic/dark surfaces)
  // tone=light → ink mark (use on daybreak/light surfaces)
  const markFile = tone === 'dark' ? 'logo-mark-white.png' : 'logo-mark-ink.png';
  const src = `${assetBase}assets/${markFile}`;
  const wordColor = tone === 'dark' ? '#F8F9FE' : 'var(--text-primary, #1C2240)';

  const mark = (
    <img
      src={src}
      alt="Celesnity"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}
    />
  );

  if (variant === 'mark') {
    return <span style={{ display: 'inline-flex', ...style }} {...rest}>{mark}</span>;
  }

  const word = (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-bold)',
        fontSize: size * 0.72,
        letterSpacing: '-0.02em',
        color: wordColor,
        lineHeight: 1,
      }}
    >
      Celesnity
    </span>
  );

  if (variant === 'wordmark') {
    return <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} {...rest}>{word}</span>;
  }

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.12, ...style }}
      {...rest}
    >
      <img
        src={src}
        alt="Celesnity"
        style={{ display: 'block', width: size * 1.4, height: size * 1.4, objectFit: 'contain', marginLeft: size * -0.12 }}
      />
      {word}
    </span>
  );
}
