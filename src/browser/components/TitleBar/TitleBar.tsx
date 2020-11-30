import cn from 'classnames';
import React, { FC } from 'react';
import styles from './TitleBar.module.scss';
import { SharedProperties } from '../../../shared/SharedProperties';

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
  const electronWindow = (window as SharedProperties).getCurrentElectronWindow?.();

  if (electronWindow === undefined) {
    return;
  }
  if (electronWindow.isMaximized()) {
    electronWindow.unmaximize();
  } else {
    electronWindow.maximize();
  }
}
