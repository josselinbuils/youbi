import cn from 'classnames';
import React, { FC, useState } from 'react';
import styles from './ControlBar.module.scss';
import { MusicInfo } from './components/MusicInfo/MusicInfo';
import { Music } from '../../../shared/Music';
import { Controls } from './components/Controls/Controls';

export const ControlBar: FC<Props> = ({ className }) => {
  const [activeMusic] = useState<Music>();
  const [isSeeking] = useState(false);

  return (
    <div
      className={cn(styles.controlBar, className, {
        [styles.seeking]: isSeeking,
      })}
    >
      <div className={styles.left}>
        <MusicInfo activeMusic={activeMusic} />
      </div>
      <div className={styles.center}>
        <Controls />
      </div>
      <div className={styles.right} />
    </div>
  );
};

interface Props {
  className: string;
}
