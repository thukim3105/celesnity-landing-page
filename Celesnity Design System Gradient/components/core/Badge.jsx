import React from 'react';

/**
 * Celesnity Badge — a compact status / category pill.
 * `gradient` uses the nebula wash for hero emphasis; the tonal tones
 * map to the accent spine at low opacity.
 */
export function Badge({
  children,
  tone = 'neutral',   // 'neutral' | 'cobalt' | 'violet' | 'magenta' | 'gradient'
  size = 'md',        // 'sm' | 'md'
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: 11, padding: '3px 9px', gap: 5 },
    md: { fontSize: 12.5, padding: '5px 12px', gap: 6 },
  };
  const s = sizes[size] || sizes.md;

  const tones = {
    neutral: { background: 'var(--surface-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' },
    cobalt:  { background: 'rgba(45,68,224,0.16)',  color: '#8FA0FF', border: '1px solid rgba(45,68,224,0.30)' },
    violet:  { background: 'rgba(110,31,198,0.18)',  color: '#C39BFF', border: '1px solid rgba(110,31,198,0.32)' },
    magenta: { background: 'rgba(177,79,208,0.16)',  color: '#E6A6F2', border: '1px solid rgba(177,79,208,0.32)' },
    gradient:{ background: 'var(--gradient-brand)',  color: '#fff', border: 'none' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-semibold)',
        fontSize: s.fontSize,
        letterSpacing: '0.01em',
        lineHeight: 1,
        padding: s.padding,
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
