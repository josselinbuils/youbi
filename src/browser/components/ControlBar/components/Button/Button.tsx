import cn from 'classnames';
import React, { FC, HTMLAttributes } from 'react';
import styles from './Button.module.scss';

export const Button: FC<Props> = ({
  checked = false,
  className,
  children,
  ...forwardedProps
}) => (
  <button
    className={cn(styles.button, { [styles.checked]: checked }, className)}
    type="button"
    {...forwardedProps}
  >
    {children}
  </button>
);

interface Props extends HTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  checked?: boolean;
}
