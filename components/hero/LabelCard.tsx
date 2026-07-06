import styles from "./HeroLabels.module.css";

type LabelCardProps = {
  left: number; // percent of stage width
  top: number; // percent of stage height
  shown: boolean;
  /** The farthest box shows only an ellipsis (signals "more cartons"). */
  ellipsis?: boolean;
  name?: string;
  code?: string;
  qty?: string;
  codeLabel: string;
  qtyLabel: string;
};

/**
 * One carton callout: a flat frosted DS card that sits above its box with a
 * short leg + accent dot pointing down to the anchor. Decorative (aria-hidden).
 */
export function LabelCard({
  left,
  top,
  shown,
  ellipsis,
  name,
  code,
  qty,
  codeLabel,
  qtyLabel,
}: LabelCardProps) {
  const className = [
    styles.card,
    shown ? styles.shown : "",
    ellipsis ? styles.ellipsisCard : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden="true"
    >
      {ellipsis ? (
        <span className={styles.ellipsis}>…</span>
      ) : (
        <>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>
            <span className={styles.metaLabel}>{codeLabel}</span>
            {code}
          </span>
          <span className={styles.meta}>
            <span className={styles.metaLabel}>{qtyLabel}</span>
            {qty}
          </span>
          <span className={styles.more}>…</span>
        </>
      )}
      <span className={styles.leg} aria-hidden="true" />
    </div>
  );
}
