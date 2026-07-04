/* Celesnity app root — screen router + phone frame. window.CelApp */
const _DS = window.CelesnityDesignSystem_29274a;
const { Logo } = _DS;
const CelIcon = window.Icon;
const S = window.CelScreens;

function TabBar({ tab, setTab }) {
  const tabs = [
    { key: 'tonight', label: 'Tonight', icon: 'moon' },
    { key: 'explore', label: 'Explore', icon: 'compass' },
    { key: 'plan', label: 'Plan', icon: 'calendar' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 12px 14px', borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-base)',
    }}>
      {tabs.map(t => {
        const on = tab === t.key;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 14px',
            color: on ? '#5566F5' : 'var(--text-muted)',
            transition: 'color var(--dur-base) var(--ease-out)',
          }}>
            <CelIcon name={t.icon} size={22} stroke={on ? 2.4 : 2} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: on ? 700 : 500, letterSpacing: '.01em' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState('tonight');
  const [dark, setDark] = React.useState(true);
  const [alerts, setAlerts] = React.useState(true);
  const tone = dark ? 'dark' : 'light';

  const titles = { tonight: null, explore: 'Explore', plan: 'Plan', settings: 'Settings' };

  let body;
  if (tab === 'tonight') body = <S.TonightScreen tone={tone} />;
  else if (tab === 'explore') body = <S.ExploreScreen tone={tone} />;
  else if (tab === 'plan') body = <S.PlanScreen tone={tone} />;
  else if (tab === 'settings') body = <S.SettingsScreen tone={tone} dark={dark} setDark={setDark} alerts={alerts} setAlerts={setAlerts} />;

  return (
    <div className={dark ? 'cosmos' : 'daybreak'} style={{
      width: 390, height: 780, borderRadius: 44, overflow: 'hidden', position: 'relative',
      background: 'var(--bg-base)', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      transition: 'background var(--dur-slow) var(--ease-out)',
    }}>
      {!authed ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <S.LoginScreen onStart={() => setAuthed(true)} />
        </div>
      ) : (
        <React.Fragment>
          {tab === 'settings' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 10px' }}>
              <button onClick={() => setTab('tonight')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex' }}><CelIcon name="arrowLeft" size={22} /></button>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.01em' }}>Settings</span>
            </div>
          ) : (
            <S.AppHeader tone={tone} onSettings={() => setTab('settings')} onBell={() => setTab('plan')} />
          )}
          {titles[tab] && tab !== 'settings' && (
            <div style={{ padding: '2px 20px 6px', fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>{titles[tab]}</div>
          )}
          <div style={{ flex: 1, overflowY: 'auto' }}>{body}</div>
          {tab !== 'settings' && <TabBar tab={tab} setTab={setTab} />}
        </React.Fragment>
      )}
    </div>
  );
}

window.CelApp = App;
