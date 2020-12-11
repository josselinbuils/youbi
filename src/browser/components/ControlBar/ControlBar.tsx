import cn from 'classnames';
import React, { FC, useState } from 'react';
import { MusicControls } from './components/MusicControls/MusicControls';
import { MusicInfo } from './components/MusicInfo/MusicInfo';
import { OutputControls } from './components/OutputControls/OutputControls';
import styles from './ControlBar.module.scss';

export const ControlBar: FC<Props> = ({ className }) => {
  const [isSeeking] = useState(false);

  return (
    <div
      className={cn(styles.controlBar, className, {
        [styles.seeking]: isSeeking,
      })}
    >
      <MusicInfo className={styles.left} />
      <MusicControls className={styles.center} />
      <OutputControls className={styles.right} />
    </div>
  );
};

interface Props {
  className: string;
}
