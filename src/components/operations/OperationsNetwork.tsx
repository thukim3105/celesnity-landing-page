import { useTranslations } from "next-intl";
import styles from "./OperationsNetwork.module.css";

type IconName = "workers" | "machines" | "items" | "sensors" | "dashboards" | "agents" | "alerts" | "apis" | "log" | "insight";

const inputs: IconName[] = ["workers", "machines", "items", "sensors"];
const outputs: IconName[] = ["dashboards", "agents", "alerts", "apis"];

function Icon({ name }: { name: IconName }) {
  const gradientId = `icon-gradient-${name}`;
  const highlighted = name === "log" || name === "insight";
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={highlighted ? `url(#${gradientId})` : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {highlighted && <defs><linearGradient id={gradientId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0" className={styles.iconGradientStart}/><stop offset=".52" className={styles.iconGradientMiddle}/><stop offset="1" className={styles.iconGradientEnd}/></linearGradient></defs>}
      {name === "workers" && <><circle cx="16" cy="9" r="4"/><path d="M8 27v-3a8 8 0 0 1 16 0v3H8Z"/></>}
      {name === "machines" && <><circle cx="11" cy="9" r="3"/><path d="M5 27h22M8 27v-8l8-7 5 5 5-4M21 17v10"/></>}
      {name === "items" && <><path d="m16 4 10 5.5v12L16 27 6 21.5v-12L16 4Z"/><path d="m6 9.5 10 5.5 10-5.5M16 15v12"/></>}
      {name === "sensors" && <><circle cx="16" cy="16" r="2"/><path d="M11 11a7 7 0 0 0 0 10M21 11a7 7 0 0 1 0 10M7 7a13 13 0 0 0 0 18M25 7a13 13 0 0 1 0 18"/></>}
      {name === "dashboards" && <><path d="M5 27V17h5v10M14 27V8h5v19M23 27V13h4v14"/></>}
      {name === "agents" && <><rect x="7" y="10" width="18" height="15" rx="3"/><path d="M16 5v5M12 17h.01M20 17h.01M12 22h8M4 16h3M25 16h3"/></>}
      {name === "alerts" && <><path d="M7 24h18l-2-3v-6a7 7 0 0 0-14 0v6l-2 3ZM13 27h6"/></>}
      {name === "apis" && <><path d="m11 8-7 8 7 8M21 8l7 8-7 8M19 5l-6 22"/></>}
      {name === "log" && <><path d="M7 4h14l5 5v19H7zM21 4v5h5M11 15h11M11 20h11M11 25h7"/></>}
      {name === "insight" && <><rect x="5" y="6" width="22" height="20" rx="2"/><path d="M10 12h12M10 17h12M10 22h8"/></>}
    </svg>
  );
}

function Graph() {
  const points = [[26,54],[50,31],[72,50],[102,26],[126,42],[151,24],[177,48],[205,28],[229,59],[42,91],[76,78],[111,89],[145,72],[184,83],[218,103],[29,128],[62,116],[98,137],[137,119],[171,136],[207,125],[48,166],[85,153],[124,176],[159,157],[198,171],[226,149],[74,207],[112,194],[151,216],[193,196]];
  const edges = [[0,1],[0,9],[1,2],[1,10],[2,4],[2,11],[3,4],[3,7],[4,5],[4,12],[5,6],[5,7],[6,8],[6,13],[7,8],[8,14],[9,10],[9,15],[10,11],[10,16],[11,12],[11,17],[12,13],[12,18],[13,14],[13,19],[14,20],[15,16],[15,21],[16,17],[16,22],[17,18],[17,23],[18,19],[18,24],[19,20],[19,25],[20,26],[21,22],[22,23],[22,27],[23,24],[23,28],[24,25],[24,29],[25,26],[25,30],[27,28],[28,29],[29,30]];
  return (
    <svg viewBox="0 0 255 240" className={styles.graphSvg} aria-hidden="true">
      <defs><linearGradient id="graph-gradient" x1="20" y1="20" x2="230" y2="220" gradientUnits="userSpaceOnUse"><stop offset="0" className={styles.iconGradientStart}/><stop offset=".5" className={styles.iconGradientMiddle}/><stop offset="1" className={styles.iconGradientEnd}/></linearGradient></defs>
      <g className={styles.graphEdges}>{edges.map(([a,b],i)=><line key={i} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]}/>)}</g>
      <g className={styles.graphPoints}>{points.map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={i%5===0?5.5:3.2} data-bright={i%5===0}/>)}</g>
    </svg>
  );
}

export function OperationsNetwork() {
  const t = useTranslations("OperationsNetwork");
  return (
    <section className={styles.section} aria-labelledby="operations-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id="operations-title" className={styles.heading}>{t("heading")}</h2>
        <p className={styles.lead}>{t("lead")}</p>
      </div>

      <div className={styles.diagram}>
        <svg className={styles.flow} viewBox="0 0 1200 460" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="flow-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" className={styles.flowStart}/>
              <stop offset=".5" className={styles.flowMiddle}/>
              <stop offset="1" className={styles.flowEnd}/>
            </linearGradient>
          </defs>
          <g className={styles.flowLines}>
            <path d="M156 135H210C270 135 276 230 324 230"/><path d="M156 201H220C274 201 280 230 324 230"/><path d="M156 267H220C274 267 280 230 324 230"/><path d="M156 333H210C270 333 276 230 324 230"/>
            <path d="M876 230C924 230 930 135 990 135H1044"/><path d="M876 230C920 230 926 201 980 201H1044"/><path d="M876 230C920 230 926 267 980 267H1044"/><path d="M876 230C924 230 930 333 990 333H1044"/>
          </g>
          <g className={styles.flowParticles}>
            {[["M156 135H210C270 135 276 230 324 230","0s"],["M156 201H220C274 201 280 230 324 230","-1.2s"],["M156 267H220C274 267 280 230 324 230","-2.4s"],["M156 333H210C270 333 276 230 324 230","-3.6s"],["M414 230H474","-.8s"],["M726 230H786","-1.6s"],["M876 230C924 230 930 135 990 135H1044","-1s"],["M876 230C920 230 926 201 980 201H1044","-2s"],["M876 230C920 230 926 267 980 267H1044","-3s"],["M876 230C924 230 930 333 990 333H1044","-4s"]].map(([path,begin],i)=><circle key={i} r="3.5"><animateMotion dur={i===4||i===5?"1.4s":"4.8s"} begin={begin} repeatCount="indefinite" path={path}/></circle>)}
          </g>
        </svg>

        <span className={styles.middleConnector} data-side="left" aria-hidden="true" />
        <span className={styles.middleConnector} data-side="right" aria-hidden="true" />

        <div className={styles.side} data-side="input">{inputs.map(name=><div className={styles.pill} key={name}><Icon name={name}/><span>{t(`flow.${name}`)}</span></div>)}</div>
        <div className={styles.processor} data-kind="log"><Icon name="log"/><span>{t("flow.eventLog")}</span></div>
        <div className={styles.graph}><Graph/><span>{t("flow.operationalGraph")}</span></div>
        <div className={styles.processor} data-kind="insight"><Icon name="insight"/><span>{t("flow.insight")}</span></div>
        <div className={styles.side} data-side="output">{outputs.map(name=><div className={styles.pill} key={name}><Icon name={name}/><span>{t(`flow.${name}`)}</span></div>)}</div>
      </div>
    </section>
  );
}
