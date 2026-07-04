/* @ds-bundle: {"format":3,"namespace":"CelesnityDesignSystem_29274a","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"StatBlock","sourcePath":"components/core/StatBlock.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"bc47f8330bc9","components/core/Button.jsx":"ff00d9117c9c","components/core/Card.jsx":"b4dea1ae4411","components/core/IconButton.jsx":"f55b16b6ee34","components/core/Input.jsx":"9fbc002dba29","components/core/Logo.jsx":"60dd4ab0ed88","components/core/StatBlock.jsx":"5ff823b06fca","components/core/Switch.jsx":"a56383e33d5b","ui_kits/celesnity-app/app.jsx":"9f46e349f9d2","ui_kits/celesnity-app/icons.jsx":"f98df70c3286","ui_kits/celesnity-app/screens.jsx":"e6d6d02fc716"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CelesnityDesignSystem_29274a = window.CelesnityDesignSystem_29274a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity Badge — a compact status / category pill.
 * `gradient` uses the nebula wash for hero emphasis; the tonal tones
 * map to the accent spine at low opacity.
 */
function Badge({
  children,
  tone = 'neutral',
  // 'neutral' | 'cobalt' | 'violet' | 'magenta' | 'gradient'
  size = 'md',
  // 'sm' | 'md'
  dot = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      fontSize: 11,
      padding: '3px 9px',
      gap: 5
    },
    md: {
      fontSize: 12.5,
      padding: '5px 12px',
      gap: 6
    }
  };
  const s = sizes[size] || sizes.md;
  const tones = {
    neutral: {
      background: 'var(--surface-card)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)'
    },
    cobalt: {
      background: 'rgba(45,68,224,0.16)',
      color: '#8FA0FF',
      border: '1px solid rgba(45,68,224,0.30)'
    },
    violet: {
      background: 'rgba(110,31,198,0.18)',
      color: '#C39BFF',
      border: '1px solid rgba(110,31,198,0.32)'
    },
    magenta: {
      background: 'rgba(177,79,208,0.16)',
      color: '#E6A6F2',
      border: '1px solid rgba(177,79,208,0.32)'
    },
    gradient: {
      background: 'var(--gradient-brand)',
      color: '#fff',
      border: 'none'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), false && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: tone === 'gradient' ? '#fff' : 'currentColor',
      boxShadow: '0 0 8px currentColor'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity Button — the brand's primary action.
 * Primary fills with the nebula gradient; secondary is a calm tinted
 * surface; ghost is text-only. Pill radius, confident scale.
 */
function Button({
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
    sm: {
      fontSize: 14,
      padding: '9px 16px',
      gap: 8,
      minHeight: 38
    },
    md: {
      fontSize: 16,
      padding: '13px 24px',
      gap: 10,
      minHeight: 48
    },
    lg: {
      fontSize: 17,
      padding: '17px 32px',
      gap: 12,
      minHeight: 56
    }
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
    WebkitFontSmoothing: 'antialiased'
  };
  const variants = {
    primary: {
      background: 'var(--gradient-brand)',
      color: 'var(--text-on-accent)',
      border: 'none',
      boxShadow: 'none'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-subtle)',
      backdropFilter: 'blur(8px)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)'
    },
    accent: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      border: 'none',
      boxShadow: 'none'
    }
  };
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hoverFx = !disabled && hover ? variant === 'ghost' ? {
    background: 'var(--surface-hover)',
    color: 'var(--text-primary)'
  } : variant === 'secondary' ? {
    background: 'var(--surface-hover)'
  } : variant === 'accent' ? {
    background: 'linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), var(--accent)'
  } : {
    background: 'linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), var(--gradient-brand)'
  } : {};
  const pressFx = !disabled && press ? {
    transform: 'scale(var(--press-scale)) translateZ(0)'
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...base,
      ...variants[variant],
      ...hoverFx,
      ...pressFx,
      ...style
    }
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginLeft: -2
    }
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginRight: -2
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity Card — the core surface container.
 * `variant="surface"` is the everyday glass/tinted card; `variant="hero"`
 * fills with the deep cosmos wash (used for feature moments and product
 * hero cards); `variant="gradient"` uses the nebula gradient outright.
 */
function Card({
  children,
  variant = 'surface',
  // 'surface' | 'hero' | 'gradient' | 'outline'
  padding = 'lg',
  // 'sm' | 'md' | 'lg'
  interactive = false,
  onClick,
  style = {},
  ...rest
}) {
  const pads = {
    sm: 'var(--space-4)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)'
  };
  const variants = {
    surface: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-primary)',
      boxShadow: 'none',
      backdropFilter: 'blur(10px)'
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-primary)'
    },
    hero: {
      background: 'var(--hero-wash)',
      border: 'none',
      color: '#F8F9FE',
      boxShadow: 'none'
    },
    gradient: {
      background: 'var(--gradient-brand)',
      border: 'none',
      color: '#fff',
      boxShadow: 'none'
    }
  };
  const [hover, setHover] = React.useState(false);
  // interactive emphasis: a clean lift (no border)
  const lift = interactive && hover ? {
    background: 'var(--surface-hover)'
  } : {};
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      borderRadius: 'var(--radius-xl)',
      padding: pads[padding] || pads.lg,
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      cursor: interactive ? 'pointer' : 'default',
      ...variants[variant],
      ...lift,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity IconButton — a square/circle button holding a single icon.
 * Matches Button's variants; defaults to a subtle glass surface.
 */
function IconButton({
  children,
  // the icon element
  variant = 'secondary',
  // 'primary' | 'secondary' | 'ghost'
  size = 'md',
  // 'sm' | 'md' | 'lg'
  shape = 'circle',
  // 'circle' | 'rounded'
  disabled = false,
  ariaLabel,
  onClick,
  style = {},
  ...rest
}) {
  const dims = {
    sm: 36,
    md: 44,
    lg: 52
  };
  const d = dims[size] || dims.md;
  const variants = {
    primary: {
      background: 'var(--gradient-brand)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 5px 16px rgba(0, 0, 0, 0.32)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none'
    }
  };
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hoverFx = !disabled && hover ? variant === 'primary' ? {
    filter: 'brightness(1.08)'
  } : {
    background: 'var(--surface-hover)',
    color: 'var(--text-primary)'
  } : {};
  const pressFx = !disabled && press ? {
    transform: 'scale(0.94)'
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), filter var(--dur-base) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      ...variants[variant],
      ...hoverFx,
      ...pressFx,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity Input — text field with optional label, leading icon and
 * hint / error. Calm tinted surface, cobalt focus ring.
 */
function Input({
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-secondary)',
      letterSpacing: '0.01em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px',
      minHeight: 50,
      background: 'var(--surface-card)',
      border: `1px solid ${error ? 'var(--accent-3)' : focus ? 'var(--accent)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--focus-shadow)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.5 : 1
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-muted)'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: type,
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      fontWeight: 'var(--fw-regular)',
      color: 'var(--text-primary)',
      minWidth: 0,
      padding: '13px 0'
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      color: error ? 'var(--accent-3)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity Logo — the orbit-and-spark mark with optional wordmark.
 * The mark is a PNG asset served with the design system; `tone` picks
 * the ink mark (for light surfaces) or the reversed white mark (for
 * cosmic surfaces).
 */
function Logo({
  variant = 'lockup',
  // 'lockup' | 'mark' | 'wordmark'
  tone = 'auto',
  // 'auto' | 'light' | 'dark'  (dark = white mark on cosmos)
  size = 32,
  assetBase = '',
  // path prefix to /assets, e.g. "../.." from a card
  style = {},
  ...rest
}) {
  // tone=dark → white reversed mark (use on cosmic/dark surfaces)
  // tone=light → ink mark (use on daybreak/light surfaces)
  const markFile = tone === 'dark' ? 'logo-mark-white.png' : 'logo-mark-ink.png';
  const src = `${assetBase}assets/${markFile}`;
  const wordColor = tone === 'dark' ? '#F8F9FE' : 'var(--text-primary, #1C2240)';
  const mark = /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "Celesnity",
    width: size,
    height: size,
    style: {
      display: 'block',
      width: size,
      height: size,
      objectFit: 'contain'
    }
  });
  if (variant === 'mark') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'inline-flex',
        ...style
      }
    }, rest), mark);
  }
  const word = /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-bold)',
      fontSize: size * 0.72,
      letterSpacing: '-0.02em',
      color: wordColor,
      lineHeight: 1
    }
  }, "Celesnity");
  if (variant === 'wordmark') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        ...style
      }
    }, rest), word);
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.12,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "Celesnity",
    style: {
      display: 'block',
      width: size * 1.4,
      height: size * 1.4,
      objectFit: 'contain',
      marginLeft: size * -0.12
    }
  }), word);
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity StatBlock — the signature big-number readout from the app
 * ("98% clear", "02:14", "12 visible planets"). A large Inter value over
 * a muted label, in a compact tinted tile.
 */
function StatBlock({
  value,
  label,
  accent = false,
  // color the value with the cobalt accent
  size = 'md',
  // 'sm' | 'md' | 'lg'
  align = 'left',
  bare = false,
  // no tile background (for use inside a hero card)
  onDark = false,
  // force fixed light text (for the always-dark cosmos/gradient wash)
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      value: 24,
      label: 12
    },
    md: {
      value: 34,
      label: 13
    },
    lg: {
      value: 56,
      label: 14
    }
  };
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: size === 'lg' ? 8 : 4,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align,
      padding: bare ? 0 : 'var(--space-4)',
      borderRadius: 'var(--radius-md)',
      background: bare ? 'transparent' : 'var(--surface-card)',
      border: bare ? 'none' : '1px solid var(--border-subtle)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-bold)',
      fontSize: s.value,
      lineHeight: 1.02,
      letterSpacing: '-0.03em',
      color: accent ? 'var(--accent)' : onDark ? '#F8F9FE' : 'var(--text-primary)'
    }
  }, value), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-regular)',
      fontSize: s.label,
      color: onDark ? 'rgba(248,249,254,0.66)' : 'var(--text-muted)',
      letterSpacing: '0.01em'
    }
  }, label));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Celesnity Switch — a pill toggle. When on, the track fills with the
 * nebula gradient. Fits the brand's day/night duality (e.g. a
 * Cosmos ⇄ Daybreak theme switch).
 */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  // 'sm' | 'md'
  label,
  style = {},
  ...rest
}) {
  const dims = size === 'sm' ? {
    w: 40,
    h: 24,
    knob: 18
  } : {
    w: 52,
    h: 30,
    knob: 24
  };
  const pad = (dims.h - dims.knob) / 2;
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  const track = /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: 'relative',
      width: dims.w,
      height: dims.h,
      flex: `0 0 ${dims.w}px`,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      background: checked ? 'var(--gradient-brand)' : 'var(--surface-hover)',
      boxShadow: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: pad,
      left: checked ? dims.w - dims.knob - pad - 1 : pad,
      width: dims.knob,
      height: dims.knob,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
  if (!label) return /*#__PURE__*/React.createElement("span", _extends({
    style: style
  }, rest), track);
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), track, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-secondary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/celesnity-app/app.jsx
try { (() => {
/* Celesnity app root — screen router + phone frame. window.CelApp */
const _DS = window.CelesnityDesignSystem_29274a;
const {
  Logo
} = _DS;
const CelIcon = window.Icon;
const S = window.CelScreens;
function TabBar({
  tab,
  setTab
}) {
  const tabs = [{
    key: 'tonight',
    label: 'Tonight',
    icon: 'moon'
  }, {
    key: 'explore',
    label: 'Explore',
    icon: 'compass'
  }, {
    key: 'plan',
    label: 'Plan',
    icon: 'calendar'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '10px 12px 14px',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-base)'
    }
  }, tabs.map(t => {
    const on = tab === t.key;
    return /*#__PURE__*/React.createElement("button", {
      key: t.key,
      onClick: () => setTab(t.key),
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 14px',
        color: on ? '#5566F5' : 'var(--text-muted)',
        transition: 'color var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(CelIcon, {
      name: t.icon,
      size: 22,
      stroke: on ? 2.4 : 2
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: on ? 700 : 500,
        letterSpacing: '.01em'
      }
    }, t.label));
  }));
}
function App() {
  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState('tonight');
  const [dark, setDark] = React.useState(true);
  const [alerts, setAlerts] = React.useState(true);
  const tone = dark ? 'dark' : 'light';
  const titles = {
    tonight: null,
    explore: 'Explore',
    plan: 'Plan',
    settings: 'Settings'
  };
  let body;
  if (tab === 'tonight') body = /*#__PURE__*/React.createElement(S.TonightScreen, {
    tone: tone
  });else if (tab === 'explore') body = /*#__PURE__*/React.createElement(S.ExploreScreen, {
    tone: tone
  });else if (tab === 'plan') body = /*#__PURE__*/React.createElement(S.PlanScreen, {
    tone: tone
  });else if (tab === 'settings') body = /*#__PURE__*/React.createElement(S.SettingsScreen, {
    tone: tone,
    dark: dark,
    setDark: setDark,
    alerts: alerts,
    setAlerts: setAlerts
  });
  return /*#__PURE__*/React.createElement("div", {
    className: dark ? 'cosmos' : 'daybreak',
    style: {
      width: 390,
      height: 780,
      borderRadius: 44,
      overflow: 'hidden',
      position: 'relative',
      background: 'var(--bg-base)',
      boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background var(--dur-slow) var(--ease-out)'
    }
  }, !authed ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(S.LoginScreen, {
    onStart: () => setAuthed(true)
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, tab === 'settings' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '20px 20px 10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('tonight'),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(CelIcon, {
    name: "arrowLeft",
    size: 22
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--text-primary)',
      letterSpacing: '-.01em'
    }
  }, "Settings")) : /*#__PURE__*/React.createElement(S.AppHeader, {
    tone: tone,
    onSettings: () => setTab('settings'),
    onBell: () => setTab('plan')
  }), titles[tab] && tab !== 'settings' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 20px 6px',
      fontFamily: 'var(--font-sans)',
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: '-.02em',
      color: 'var(--text-primary)'
    }
  }, titles[tab]), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, body), tab !== 'settings' && /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    setTab: setTab
  })));
}
window.CelApp = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/celesnity-app/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/celesnity-app/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Celesnity UI-kit icon set.
   No icon system shipped with the brand kit, so we use a thin 2px
   line set (Lucide-style geometry) that matches the minimal celestial
   aesthetic. See README ICONOGRAPHY. Exposes window.Icon. */
const CEL_ICON_PATHS = {
  home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 10.5 12 3l9 7.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9.5V21h14V9.5"
  })),
  compass: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m15.5 8.5-2 5-5 2 2-5z"
  })),
  calendar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4.5",
    width: "18",
    height: "16",
    rx: "2.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9h18M8 3v4M16 3v4"
  })),
  star: /*#__PURE__*/React.createElement("path", {
    d: "M12 3.2l2.6 5.9 6.4.6-4.85 4.25 1.45 6.3L12 17.1l-5.6 3.15 1.45-6.3L3 9.7l6.4-.6z"
  }),
  moon: /*#__PURE__*/React.createElement("path", {
    d: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"
  }),
  sun: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
  })),
  bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 20a2.2 2.2 0 0 0 4 0"
  })),
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.5 1.5 0 0 0 .3 1.65l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.5 1.5 0 0 0-2.55 1.06V21a2 2 0 1 1-4 0v-.09A1.5 1.5 0 0 0 6.6 19.4a1.5 1.5 0 0 0-1.65.3l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.5 1.5 0 0 0 3 14.6a1.5 1.5 0 0 0-1.37-.9H1.5a2 2 0 1 1 0-4h.09A1.5 1.5 0 0 0 3 8.6a1.5 1.5 0 0 0-.3-1.65l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.5 1.5 0 0 0 8 3.9a1.5 1.5 0 0 0 .9-1.37V2.5a2 2 0 1 1 4 0v.09A1.5 1.5 0 0 0 15 3.9"
  })),
  arrow: /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }),
  arrowLeft: /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5M11 18l-6-6 6-6"
  }),
  plus: /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }),
  location: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "2.8"
  })),
  share: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "5",
    r: "2.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "12",
    r: "2.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "19",
    r: "2.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m8.4 10.7 7.2-4.4M8.4 13.3l7.2 4.4"
  })),
  telescope: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m14 3 6.5 3.5-2 3.5L12 6.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6.5 6 6 3.5-3 5.2-6-3.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 15v6M6 21h6M12 12l6 3"
  })),
  cloud: /*#__PURE__*/React.createElement("path", {
    d: "M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.5A3.75 3.75 0 0 0 6.5 19z"
  }),
  check: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })
};
function Icon({
  name,
  size = 22,
  stroke = 2,
  fill = 'none',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block',
      flex: 'none',
      ...style
    }
  }, rest), CEL_ICON_PATHS[name] || null);
}
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/celesnity-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/celesnity-app/screens.jsx
try { (() => {
/* Celesnity app — shared chrome + screens. Exposes window.CelScreens. */
const DS = window.CelesnityDesignSystem_29274a;
const {
  Button,
  Card,
  StatBlock,
  Badge,
  Input,
  Switch,
  IconButton,
  Logo
} = DS;
const Icon = window.Icon;
const ICON_BLUE = '#5566F5'; // unified app icon color

/* ---------------- Header ---------------- */
function AppHeader({
  tone,
  place = 'Ojai, CA',
  onBell,
  onSettings
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "mark",
    tone: tone,
    size: 26,
    assetBase: "../../"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12.5,
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "location",
    size: 13,
    stroke: 2
  }), " ", place)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Alerts",
    variant: "ghost",
    size: "sm",
    onClick: onBell,
    style: {
      color: ICON_BLUE
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 19
  })), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Settings",
    variant: "ghost",
    size: "sm",
    onClick: onSettings,
    style: {
      color: ICON_BLUE
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 19
  }))));
}

/* ---------------- Object row ---------------- */
function SkyRow({
  icon,
  name,
  meta,
  value,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      color: ICON_BLUE
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15.5,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value));
}

/* ---------------- Tonight (home) ---------------- */
function TonightScreen({
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "hero",
    padding: "lg",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "cobalt"
  }, "Tonight's sky"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.6)',
      fontFamily: 'var(--font-sans)'
    }
  }, "9:42 PM")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "98% clear",
    label: "Excellent seeing conditions",
    size: "lg",
    bare: true,
    onDark: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "12",
    label: "visible planets"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "4.2\xB0",
    label: "moon altitude"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true
  }, "Start stargazing"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      margin: '4px 2px 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 17,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Visible now"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "See all")), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "star",
    name: "Jupiter",
    meta: "Rising \xB7 SE horizon",
    value: "21:40",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "star",
    name: "Saturn",
    meta: "High \xB7 south-east",
    value: "63\xB0",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "telescope",
    name: "Orion Nebula",
    meta: "Constellation \xB7 Orion",
    value: "M42",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "moon",
    name: "Waning crescent",
    meta: "18% illuminated",
    value: "4.2\xB0",
    tone: tone
  }));
}

/* ---------------- Explore (sky map list) ---------------- */
function ExploreScreen({
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Search stars, planets, galaxies",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 18
    }),
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement(Card, {
    variant: "gradient",
    padding: "lg",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: 600,
      letterSpacing: '.03em'
    }
  }, "ISS PASS TONIGHT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 30,
      fontWeight: 700,
      color: '#fff',
      letterSpacing: '-.02em',
      marginTop: 6
    }
  }, "22:05 \xB7 4 min"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 4
    }
  }, "Bright \xB7 magnitude \u22123.1 \xB7 NW \u2192 SE")), /*#__PURE__*/React.createElement(Icon, {
    name: "telescope",
    size: 30,
    style: {
      color: '#fff',
      opacity: 0.9
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gradient"
  }, "Planets"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Constellations"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Galaxies"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Meteors")), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "star",
    name: "Mars",
    meta: "Rising \xB7 east",
    value: "23:10",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "telescope",
    name: "Andromeda",
    meta: "Galaxy \xB7 M31 \xB7 overhead",
    value: "Faint",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "star",
    name: "Vega",
    meta: "Constellation \xB7 Lyra",
    value: "79\xB0",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "star",
    name: "Pleiades",
    meta: "Open cluster \xB7 M45",
    value: "41\xB0",
    tone: tone
  }));
}

/* ---------------- Plan (dawn) ---------------- */
function PlanScreen({
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "surface",
    padding: "lg",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "cobalt"
  }, "Dawn window"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "02 : 14",
    label: "Sunrise in",
    size: "lg",
    bare: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "17\xB0",
    label: "horizon temp",
    accent: true
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "Low",
    label: "light pollution"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true
  }, "Plan my dawn"))), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontSize: 17,
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '4px 2px 6px'
    }
  }, "This week"), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "moon",
    name: "New moon",
    meta: "Darkest skies \xB7 best viewing",
    value: "Thu",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "star",
    name: "Perseid peak",
    meta: "Meteor shower \xB7 ~60/hr",
    value: "Sat",
    tone: tone
  }), /*#__PURE__*/React.createElement(SkyRow, {
    icon: "sun",
    name: "Golden dawn",
    meta: "Clear horizon forecast",
    value: "Sun",
    tone: tone
  }));
}

/* ---------------- Settings sheet ---------------- */
function SettingsScreen({
  tone,
  dark,
  setDark,
  alerts,
  setAlerts
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "surface",
    padding: "md",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dark ? 'moon' : 'sun',
    size: 20,
    style: {
      color: ICON_BLUE
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, dark ? 'Cosmos' : 'Daybreak', " mode"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, "Two skies, one identity"))), /*#__PURE__*/React.createElement(Switch, {
    checked: dark,
    onChange: setDark
  }))), /*#__PURE__*/React.createElement(Card, {
    variant: "surface",
    padding: "md",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20,
    style: {
      color: ICON_BLUE
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Meteor & ISS alerts")), /*#__PURE__*/React.createElement(Switch, {
    checked: alerts,
    onChange: setAlerts
  }))), /*#__PURE__*/React.createElement(Card, {
    variant: "outline",
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "share",
    size: 20,
    style: {
      color: ICON_BLUE
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Share tonight's sky map"))));
}

/* ---------------- Login ---------------- */
function LoginScreen({
  onStart
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '54px 26px 30px',
      background: 'var(--cosmos-wash)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    tone: "dark",
    size: 30,
    assetBase: "../../"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      letterSpacing: '.22em',
      textTransform: 'uppercase',
      color: 'rgba(201,206,232,0.7)',
      fontWeight: 600
    }
  }, "Visual identity \xB7 v1.0"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 40,
      lineHeight: 1.04,
      letterSpacing: '-.03em',
      fontWeight: 700,
      color: '#F8F9FE',
      margin: '14px 0 12px'
    }
  }, "Two skies,", /*#__PURE__*/React.createElement("br", null), "one identity."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15.5,
      lineHeight: 1.6,
      color: 'var(--starlight)',
      margin: 0,
      maxWidth: 320
    }
  }, "Track tonight's planets, meteor showers and the moon \u2014 across a cosmic night and a warm daybreak."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "you@stars.io",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 17,
      style: {
        color: ICON_BLUE
      }
    })
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onStart
  }, "Start stargazing"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    onClick: onStart
  }, "Explore the sky first"))));
}
window.CelScreens = {
  AppHeader,
  TonightScreen,
  ExploreScreen,
  PlanScreen,
  SettingsScreen,
  LoginScreen
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/celesnity-app/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.Switch = __ds_scope.Switch;

})();
