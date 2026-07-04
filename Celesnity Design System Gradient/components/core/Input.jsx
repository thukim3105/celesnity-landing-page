import React from 'react';

/**
 * Celesnity Input — text field with optional label, leading icon and
 * hint / error. Calm tinted surface, cobalt focus ring.
 */
export function Input({
  label,
  hint,
  error,
  iconLeft = null,
  type = 'text',
  placeholder = '',
  value,
  defaultValue,
  onChange,
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const rid = id || React.useId?.() || 'cel-input';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', ...style }}>
      {label && (
        <label htmlFor={rid} style={{
          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 'var(--fw-medium)',
          color: 'var(--text-secondary)', letterSpacing: '0.01em',
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 16px',
        minHeight: 50,
        background: 'var(--surface-card)',
        border: `1px solid ${error ? 'var(--accent-3)' : focus ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--focus-shadow)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
      }}>
        {iconLeft && <span style={{ display: 'inline-flex', color: 'var(--text-muted)' }}>{iconLeft}</span>}
        <input
          id={rid}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 'var(--fw-regular)',
            color: 'var(--text-primary)', minWidth: 0, padding: '13px 0',
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 12.5,
          color: error ? 'var(--accent-3)' : 'var(--text-muted)',
        }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
