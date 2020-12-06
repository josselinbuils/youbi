import cn from 'classnames';
import React, { FC, useState } from 'react';
import { Controls } from './components/Controls/Controls';
import { MusicInfo } from './components/MusicInfo/MusicInfo';
import { OutputSelector } from './components/OutputSelector/OutputSelector';
import styles from './ControlBar.module.scss';

export const ControlBar: FC<Props> = ({ className }) => {
  const [isSeeking] = useState(false);

  return (
    <div
      className={cn(styles.controlBar, className, {
        [styles.seeking]: isSeeking,
      })}
    >
      <div className={styles.left}>
        <MusicInfo />
      </div>
      <div className={styles.center}>
        <Controls />
      </div>
      <div className={styles.right}>
        <OutputSelector />
      </div>
    </div>
  );
};

interface Props {
  className: string;
}
