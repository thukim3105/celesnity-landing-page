import React from 'react';

export interface IconButtonProps {
  /** The icon element. */
  children: React.ReactNode;
  /** @default "secondary" */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** @default "circle" */
  shape?: 'circle' | 'rounded';
  disabled?: boolean;
  /** Accessible label — required since there's no visible text. */
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
