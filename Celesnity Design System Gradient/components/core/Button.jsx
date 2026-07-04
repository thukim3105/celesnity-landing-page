import React from 'react';

/**
 * Celesnity Button — the brand's primary action.
 * Primary fills with the nebula gradient; secondary is a calm tinted
 * surface; ghost is text-only. Pill radius, confident scale.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: 14, padding: '9px 16px', gap: 8, minHeight: 38 },
    md: { fontSize: 16, padding: '13px 24px', gap: 10, minHeight: 48 },
    lg: { fontSize: 17, padding: '17px 32px', gap: 12, minHeight: 56 },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-semibold)',
    fontSize: s.fontSize,
    letterSpacing: '-0.01em',
    lineHeight: 1,
    padding: s.padding,
    minHeight: s.minHeight,
    width: fullWidth ? '100%' : 'auto',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out), filter var(--dur-base) var(--ease-out)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    backfaceVisibility: 'hidden',
    WebkitFontSmoothing: 'antialiased',
  };

  const variants = {
    primary: {
      background: 'var(--gradient-brand)',
      color: 'var(--text-on-accent)',
      border: 'none',
      boxShadow: 'none',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-subtle)',
      backdropFilter: 'blur(8px)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    accent: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      border: 'none',
      boxShadow: 'none',
    },
  };

  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const hoverFx = !disabled && hover
    ? (variant === 'ghost'
        ? { background: 'var(--surface-hover)', color: 'var(--text-primary)' }
        : variant === 'secondary'
          ? { background: 'var(--surface-hover)' }
          : variant === 'accent'
            ? { background: 'linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), var(--accent)' }
            : { background: 'linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), var(--gradient-brand)' })
    : {};

  const pressFx = !disabled && press ? { transform: 'scale(var(--press-scale)) translateZ(0)' } : {};

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{ ...base, ...variants[variant], ...hoverFx, ...pressFx, ...style }}
      {...rest}
    >
      {iconLeft && <span style={{ display: 'inline-flex', marginLeft: -2 }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'inline-flex', marginRight: -2 }}>{iconRight}</span>}
    </button>
  );
}
