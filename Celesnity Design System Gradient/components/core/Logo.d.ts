import React from 'react';

export interface LogoProps {
  /** @default "lockup" */
  variant?: 'lockup' | 'mark' | 'wordmark';
  /** `dark` = white reversed mark for cosmic surfaces; `light` = ink mark. @default "auto" */
  tone?: 'auto' | 'light' | 'dark';
  /** Mark height in px; wordmark scales from it. @default 32 */
  size?: number;
  /** Path prefix to the /assets folder (e.g. "../../" from a nested card). @default "" */
  assetBase?: string;
  style?: React.CSSProperties;
}

export function Logo(props: LogoProps): JSX.Element;
