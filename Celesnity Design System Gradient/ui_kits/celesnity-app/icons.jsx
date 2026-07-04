/* Celesnity UI-kit icon set.
   No icon system shipped with the brand kit, so we use a thin 2px
   line set (Lucide-style geometry) that matches the minimal celestial
   aesthetic. See README ICONOGRAPHY. Exposes window.Icon. */
const CEL_ICON_PATHS = {
  home:    <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>,
  calendar:<><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  star:    <path d="M12 3.2l2.6 5.9 6.4.6-4.85 4.25 1.45 6.3L12 17.1l-5.6 3.15 1.45-6.3L3 9.7l6.4-.6z"/>,
  moon:    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>,
  sun:     <><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></>,
  bell:    <><path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></>,
  search:  <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.5 1.5 0 0 0 .3 1.65l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.5 1.5 0 0 0-2.55 1.06V21a2 2 0 1 1-4 0v-.09A1.5 1.5 0 0 0 6.6 19.4a1.5 1.5 0 0 0-1.65.3l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.5 1.5 0 0 0 3 14.6a1.5 1.5 0 0 0-1.37-.9H1.5a2 2 0 1 1 0-4h.09A1.5 1.5 0 0 0 3 8.6a1.5 1.5 0 0 0-.3-1.65l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.5 1.5 0 0 0 8 3.9a1.5 1.5 0 0 0 .9-1.37V2.5a2 2 0 1 1 4 0v.09A1.5 1.5 0 0 0 15 3.9"/></>,
  arrow:   <path d="M5 12h14M13 6l6 6-6 6"/>,
  arrowLeft:<path d="M19 12H5M11 18l-6-6 6-6"/>,
  plus:    <path d="M12 5v14M5 12h14"/>,
  location:<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/></>,
  share:   <><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 10.7 7.2-4.4M8.4 13.3l7.2 4.4"/></>,
  telescope:<><path d="m14 3 6.5 3.5-2 3.5L12 6.5z"/><path d="m6.5 6 6 3.5-3 5.2-6-3.5z"/><path d="M9 15v6M6 21h6M12 12l6 3"/></>,
  cloud:   <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.5A3.75 3.75 0 0 0 6.5 19z"/>,
  check:   <path d="M20 6 9 17l-5-5"/>,
};

function Icon({ name, size = 22, stroke = 2, fill = 'none', style = {}, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flex: 'none', ...style }} {...rest}>
      {CEL_ICON_PATHS[name] || null}
    </svg>
  );
}

window.Icon = Icon;
