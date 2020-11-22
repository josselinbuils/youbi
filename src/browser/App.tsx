import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import React, { FC } from 'react';
import { SharedProperties } from '../shared/interfaces/SharedProperties';
import { Browser } from './components/Browser/Browser';
import { TitleBar } from './components/TitleBar/TitleBar';
import './main.scss';
import styles from './App.module.scss';
import { ControlBar } from './components/ControlBar/ControlBar';

export const App: FC = () => {
  useKeyMap({
    'Control+D,Meta+D': () =>
      (window as SharedProperties)
        .getCurrentElectronWindow?.()
        .webContents.openDevTools(),
  });

  return (
    <div className={styles.app}>
      <TitleBar className={styles.titleBar} />
      <Browser className={styles.browser} />
      <ControlBar className={styles.controlBar} />
    </div>
  );
};
