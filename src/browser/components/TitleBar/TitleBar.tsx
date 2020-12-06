import cn from 'classnames';
import React, { FC } from 'react';
import { SharedProperties } from '../../../shared/SharedProperties';
import styles from './TitleBar.module.scss';

export const TitleBar: FC<Props> = ({ className }) => (
  <header
    className={cn(styles.titleBar, className)}
    onDoubleClick={toggleMaximize}
  />
);

interface Props {
  className: string;
}

function toggleMaximize() {
  const remote = window.remote as SharedProperties;

  if (remote.isWindowMaximized()) {
    remote.unmaximizeWindow();
  } else {
    remote.maximizeWindow();
  }
}
