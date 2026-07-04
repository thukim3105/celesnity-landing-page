import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  /** @default "surface" */
  variant?: 'surface' | 'hero' | 'gradient' | 'outline';
  /** @default "lg" */
  padding?: 'sm' | 'md' | 'lg';
  /** Enables hover lift + accent glow. */
  interactive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
