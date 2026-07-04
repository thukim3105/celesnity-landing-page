import React from 'react';

/**
 * Celesnity Card — the core surface container.
 * `variant="surface"` is the everyday glass/tinted card; `variant="hero"`
 * fills with the deep cosmos wash (used for feature moments and product
 * hero cards); `variant="gradient"` uses the nebula gradient outright.
 */
export function Card({
  children,
  variant = 'surface',    // 'surface' | 'hero' | 'gradient' | 'outline'
  padding = 'lg',         // 'sm' | 'md' | 'lg'
  interactive = false,
  onClick,
  style = {},
  ...rest
}) {
  const pads = { sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' };

  const variants = {
    surface: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-primary)',
      boxShadow: 'none',
      backdropFilter: 'blur(10px)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-primary)',
    },
    hero: {
      background: 'var(--hero-wash)',
      border: 'none',
      color: '#F8F9FE',
      boxShadow: 'none',
    },
    gradient: {
      background: 'var(--gradient-brand)',
      border: 'none',
      color: '#fff',
      boxShadow: 'none',
    },
  };

  const [hover, setHover] = React.useState(false);
  // interactive emphasis: hover only shifts surface colour (no lift, no shadow)
  const lift = interactive && hover
    ? { background: 'var(--surface-hover)' }
    : {};

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: pads[padding] || pads.lg,
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        cursor: interactive ? 'pointer' : 'default',
        ...variants[variant],
        ...lift,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
