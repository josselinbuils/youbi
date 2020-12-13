import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import React, { FC, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { SharedProperties } from '../shared/SharedProperties';
import { Browser } from './components/Browser/Browser';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TitleBar } from './components/TitleBar/TitleBar';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { ControlBar } from './components/ControlBar/ControlBar';
import styles from './App.module.scss';
import { LOG_ACTION, LogAction } from '../shared/actions';

export const App: FC = () => {
  useKeyMap({
    'Control+D,Meta+D': () =>
      (window.remote as SharedProperties).openDevTools(),
  });

  useEffect(() => {
    const { actions } = window.remote as SharedProperties;
    const logActionListener = ({ args }: LogAction) => console.log(...args);

    actions.on(LOG_ACTION, logActionListener);

    return () => {
      actions.off(LOG_ACTION, logActionListener);
    };
  }, []);

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
