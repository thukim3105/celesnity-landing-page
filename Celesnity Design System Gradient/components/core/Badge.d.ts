import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'cobalt' | 'violet' | 'magenta' | 'gradient';
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
