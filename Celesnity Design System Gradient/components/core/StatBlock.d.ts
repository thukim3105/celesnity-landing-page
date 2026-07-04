import React from 'react';

export interface StatBlockProps {
  value: React.ReactNode;
  label?: React.ReactNode;
  /** Tint the value with the cobalt accent. */
  accent?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** @default "left" */
  align?: 'left' | 'center';
  /** Drop the tile background — for placing inside a hero card. */
  bare?: boolean;
  /** Force fixed light text — use on the always-dark cosmos/gradient hero wash so it stays legible in Daybreak. */
  onDark?: boolean;
  style?: React.CSSProperties;
}

export function StatBlock(props: StatBlockProps): JSX.Element;
