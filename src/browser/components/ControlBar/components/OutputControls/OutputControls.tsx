import React, { FC } from 'react';
import { OutputSelector } from './components/OutputSelector/OutputSelector';
import { VolumeBar } from './components/VolumeBar';
import styles from './OutputControls.module.scss';

export const OutputControls: FC = () => (
  <div className={styles.outputControls}>
    <VolumeBar className={styles.volumeBar} />
    <OutputSelector />
  </div>
);
