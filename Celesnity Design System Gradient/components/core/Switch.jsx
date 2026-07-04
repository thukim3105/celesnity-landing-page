import React from 'react';

/**
 * Celesnity Switch — a pill toggle. When on, the track fills with the
 * nebula gradient. Fits the brand's day/night duality (e.g. a
 * Cosmos ⇄ Daybreak theme switch).
 */
export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',       // 'sm' | 'md'
  label,
  style = {},
  ...rest
}) {
  const dims = size === 'sm'
    ? { w: 40, h: 24, knob: 18 }
    : { w: 52, h: 30, knob: 24 };
  const pad = (dims.h - dims.knob) / 2;

  const toggle = () => { if (!disabled && onChange) onChange(!checked); };

  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      style={{
        position: 'relative',
        width: dims.w, height: dims.h,
        flex: `0 0 ${dims.w}px`,
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        background: checked ? 'var(--gradient-brand)' : 'var(--surface-hover)',
        boxShadow: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: pad,
        left: checked ? dims.w - dims.knob - pad - 1 : pad,
        width: dims.knob, height: dims.knob,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        transition: 'left var(--dur-base) var(--ease-out)',
      }} />
    </button>
  );

  if (!label) return <span style={style} {...rest}>{track}</span>;

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer', ...style }} {...rest}>
      {track}
      <span style={{
        fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 'var(--fw-medium)',
        color: 'var(--text-secondary)',
      }}>
        {label}
      </span>
    </label>
  );
}
