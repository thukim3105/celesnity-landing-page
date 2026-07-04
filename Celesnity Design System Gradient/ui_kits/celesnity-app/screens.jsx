/* Celesnity app — shared chrome + screens. Exposes window.CelScreens. */
const DS = window.CelesnityDesignSystem_29274a;
const { Button, Card, StatBlock, Badge, Input, Switch, IconButton, Logo } = DS;
const Icon = window.Icon;
const ICON_BLUE = '#5566F5';   // unified app icon color

/* ---------------- Header ---------------- */
function AppHeader({ tone, place = 'Ojai, CA', onBell, onSettings }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Logo variant="mark" tone={tone} size={26} assetBase="../../" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
          <Icon name="location" size={13} stroke={2} /> {place}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton ariaLabel="Alerts" variant="ghost" size="sm" onClick={onBell} style={{ color: ICON_BLUE }}><Icon name="bell" size={19} /></IconButton>
        <IconButton ariaLabel="Settings" variant="ghost" size="sm" onClick={onSettings} style={{ color: ICON_BLUE }}><Icon name="settings" size={19} /></IconButton>
      </div>
    </div>
  );
}

/* ---------------- Object row ---------------- */
function SkyRow({ icon, name, meta, value, tone }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: ICON_BLUE }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15.5, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>{meta}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

/* ---------------- Tonight (home) ---------------- */
function TonightScreen({ tone }) {
  return (
    <div style={{ padding: '4px 20px 20px' }}>
      <Card variant="hero" padding="lg" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Badge tone="cobalt">Tonight's sky</Badge>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-sans)' }}>9:42 PM</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <StatBlock value="98% clear" label="Excellent seeing conditions" size="lg" bare onDark />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <StatBlock value="12" label="visible planets" />
          <StatBlock value="4.2°" label="moon altitude" />
        </div>
        <div style={{ marginTop: 18 }}>
          <Button variant="primary" fullWidth>Start stargazing</Button>
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 2px 6px' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Visible now</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>See all</span>
      </div>
      <SkyRow icon="star" name="Jupiter" meta="Rising · SE horizon" value="21:40" tone={tone} />
      <SkyRow icon="star" name="Saturn" meta="High · south-east" value="63°" tone={tone} />
      <SkyRow icon="telescope" name="Orion Nebula" meta="Constellation · Orion" value="M42" tone={tone} />
      <SkyRow icon="moon" name="Waning crescent" meta="18% illuminated" value="4.2°" tone={tone} />
    </div>
  );
}

/* ---------------- Explore (sky map list) ---------------- */
function ExploreScreen({ tone }) {
  return (
    <div style={{ padding: '4px 20px 20px' }}>
      <Input placeholder="Search stars, planets, galaxies" iconLeft={<Icon name="search" size={18} />} style={{ marginBottom: 16 }} />
      <Card variant="gradient" padding="lg" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600, letterSpacing: '.03em' }}>ISS PASS TONIGHT</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-.02em', marginTop: 6 }}>22:05 · 4 min</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Bright · magnitude −3.1 · NW → SE</div>
          </div>
          <Icon name="telescope" size={30} style={{ color: '#fff', opacity: 0.9 }} />
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <Badge tone="gradient">Planets</Badge>
        <Badge tone="neutral">Constellations</Badge>
        <Badge tone="neutral">Galaxies</Badge>
        <Badge tone="neutral">Meteors</Badge>
      </div>
      <SkyRow icon="star" name="Mars" meta="Rising · east" value="23:10" tone={tone} />
      <SkyRow icon="telescope" name="Andromeda" meta="Galaxy · M31 · overhead" value="Faint" tone={tone} />
      <SkyRow icon="star" name="Vega" meta="Constellation · Lyra" value="79°" tone={tone} />
      <SkyRow icon="star" name="Pleiades" meta="Open cluster · M45" value="41°" tone={tone} />
    </div>
  );
}

/* ---------------- Plan (dawn) ---------------- */
function PlanScreen({ tone }) {
  return (
    <div style={{ padding: '4px 20px 20px' }}>
      <Card variant="surface" padding="lg" style={{ marginBottom: 18 }}>
        <Badge tone="cobalt">Dawn window</Badge>
        <div style={{ marginTop: 16 }}>
          <StatBlock value="02 : 14" label="Sunrise in" size="lg" bare />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <StatBlock value="17°" label="horizon temp" accent />
          <StatBlock value="Low" label="light pollution" />
        </div>
        <div style={{ marginTop: 18 }}>
          <Button variant="primary" fullWidth>Plan my dawn</Button>
        </div>
      </Card>
      <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '4px 2px 6px' }}>This week</span>
      <SkyRow icon="moon" name="New moon" meta="Darkest skies · best viewing" value="Thu" tone={tone} />
      <SkyRow icon="star" name="Perseid peak" meta="Meteor shower · ~60/hr" value="Sat" tone={tone} />
      <SkyRow icon="sun" name="Golden dawn" meta="Clear horizon forecast" value="Sun" tone={tone} />
    </div>
  );
}

/* ---------------- Settings sheet ---------------- */
function SettingsScreen({ tone, dark, setDark, alerts, setAlerts }) {
  return (
    <div style={{ padding: '4px 20px 20px' }}>
      <Card variant="surface" padding="md" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name={dark ? 'moon' : 'sun'} size={20} style={{ color: ICON_BLUE }} />
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{dark ? 'Cosmos' : 'Daybreak'} mode</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>Two skies, one identity</div>
            </div>
          </div>
          <Switch checked={dark} onChange={setDark} />
        </div>
      </Card>
      <Card variant="surface" padding="md" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="bell" size={20} style={{ color: ICON_BLUE }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Meteor & ISS alerts</div>
          </div>
          <Switch checked={alerts} onChange={setAlerts} />
        </div>
      </Card>
      <Card variant="outline" padding="md">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="share" size={20} style={{ color: ICON_BLUE }} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Share tonight's sky map</div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Login ---------------- */
function LoginScreen({ onStart }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '54px 26px 30px', background: 'var(--cosmos-wash)' }}>
      <div>
        <Logo tone="dark" size={30} assetBase="../../" />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,206,232,0.7)', fontWeight: 600 }}>Visual identity · v1.0</div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 40, lineHeight: 1.04, letterSpacing: '-.03em', fontWeight: 700, color: '#F8F9FE', margin: '14px 0 12px' }}>Two skies,<br />one identity.</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15.5, lineHeight: 1.6, color: 'var(--starlight)', margin: 0, maxWidth: 320 }}>Track tonight's planets, meteor showers and the moon — across a cosmic night and a warm daybreak.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
          <Input placeholder="you@stars.io" iconLeft={<Icon name="star" size={17} style={{ color: ICON_BLUE }} />} />
          <Button variant="primary" size="lg" fullWidth onClick={onStart}>Start stargazing</Button>
          <Button variant="ghost" fullWidth onClick={onStart}>Explore the sky first</Button>
        </div>
      </div>
    </div>
  );
}

window.CelScreens = { AppHeader, TonightScreen, ExploreScreen, PlanScreen, SettingsScreen, LoginScreen };
