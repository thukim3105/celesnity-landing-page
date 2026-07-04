import React from 'react';

/**
 * Celesnity StatBlock — the signature big-number readout from the app
 * ("98% clear", "02:14", "12 visible planets"). A large Inter value over
 * a muted label, in a compact tinted tile.
 */
export function StatBlock({
  value,
  label,
  accent = false,     // color the value with the cobalt accent
  size = 'md',        // 'sm' | 'md' | 'lg'
  align = 'left',
  bare = false,       // no tile background (for use inside a hero card)
  onDark = false,     // force fixed light text (for the always-dark cosmos/gradient wash)
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { value: 24, label: 12 },
    md: { value: 34, label: 13 },
    lg: { value: 56, label: 14 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: size === 'lg' ? 8 : 4,
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        padding: bare ? 0 : 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: bare ? 'transparent' : 'var(--surface-card)',
        border: bare ? 'none' : '1px solid var(--border-subtle)',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-bold)',
        fontSize: s.value,
        lineHeight: 1.02,
        letterSpacing: '-0.03em',
        color: accent ? 'var(--accent)' : (onDark ? '#F8F9FE' : 'var(--text-primary)'),
      }}>
        {value}
      </span>
      {label && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-regular)',
          fontSize: s.label,
          color: onDark ? 'rgba(248,249,254,0.66)' : 'var(--text-muted)',
          letterSpacing: '0.01em',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
