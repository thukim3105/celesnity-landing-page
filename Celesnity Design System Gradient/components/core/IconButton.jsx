import React from 'react';

/**
 * Celesnity IconButton — a square/circle button holding a single icon.
 * Matches Button's variants; defaults to a subtle glass surface.
 */
export function IconButton({
  children,          // the icon element
  variant = 'secondary',  // 'primary' | 'secondary' | 'ghost'
  size = 'md',       // 'sm' | 'md' | 'lg'
  shape = 'circle',  // 'circle' | 'rounded'
  disabled = false,
  ariaLabel,
  onClick,
  style = {},
  ...rest
}) {
  const dims = { sm: 36, md: 44, lg: 52 };
  const d = dims[size] || dims.md;

  const variants = {
    primary:   { background: 'var(--gradient-brand)', color: '#fff', border: 'none', boxShadow: '0 5px 16px rgba(0, 0, 0, 0.32)' },
    secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
  };

  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hoverFx = !disabled && hover
    ? (variant === 'primary' ? { filter: 'brightness(1.08)' } : { background: 'var(--surface-hover)', color: 'var(--text-primary)' })
    : {};
  const pressFx = !disabled && press ? { transform: 'scale(0.94)' } : {};

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: d, height: d,
        borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), filter var(--dur-base) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...variants[variant], ...hoverFx, ...pressFx, ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
