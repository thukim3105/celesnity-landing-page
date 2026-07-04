import React from 'react';

export interface InputProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message; also flips the border/hint to the magenta highlight. */
  error?: React.ReactNode;
  iconLeft?: React.ReactNode;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
