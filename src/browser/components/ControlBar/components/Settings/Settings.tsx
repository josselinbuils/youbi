import cn from 'classnames';
import React, { FC } from 'react';
import { OutputSelector } from './components/OutputSelector/OutputSelector';
import { VolumeBar } from './components/VolumeBar';
import styles from './Settings.module.scss';

export const Settings: FC<Props> = ({ className }) => (
  <div className={cn(styles.outputControls, className)}>
    <VolumeBar className={styles.volumeBar} />
    <OutputSelector />
  </div>
);

interface Props {
  className: string;
}
