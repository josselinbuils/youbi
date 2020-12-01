import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import React, { FC } from 'react';
import { SharedProperties } from '../shared/SharedProperties';
import styles from './App.module.scss';
import { Browser } from './components/Browser/Browser';
import { TitleBar } from './components/TitleBar/TitleBar';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { ControlBar } from './components/ControlBar/ControlBar';

export const App: FC = () => {
  useKeyMap({
    'Control+D,Meta+D': () =>
      (window.remote as SharedProperties).openDevTools(),
  });

  return (
    <AudioProvider>
      <div className={styles.app}>
        <TitleBar className={styles.titleBar} />
        <Browser className={styles.browser} />
        <ControlBar className={styles.controlBar} />
      </div>
    </AudioProvider>
  );
};
