import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import React, { FC } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { SharedProperties } from '../shared/SharedProperties';
import { Browser } from './components/Browser/Browser';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TitleBar } from './components/TitleBar/TitleBar';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { ControlBar } from './components/ControlBar/ControlBar';
import styles from './App.module.scss';

export const App: FC = () => {
  useKeyMap({
    'Control+D,Meta+D': () =>
      (window.remote as SharedProperties).openDevTools(),
  });

  return (
    <ErrorBoundary>
      <AudioProvider>
        <div className={styles.app}>
          <TitleBar className={styles.titleBar} />
          <Browser className={styles.browser} />
          <ControlBar className={styles.controlBar} />
        </div>
      </AudioProvider>
    </ErrorBoundary>
  );
};
