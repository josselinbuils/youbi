import cn from 'classnames';
import React, { FC } from 'react';
import styles from './TitleBar.module.scss';

export const TitleBar: FC<Props> = ({ className }) => (
  <header className={cn(styles.titleBar, className)} />
);

interface Props {
  className: string;
}
