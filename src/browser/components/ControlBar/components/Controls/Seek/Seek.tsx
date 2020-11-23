import dayjs from 'dayjs';
import React, { FC, useLayoutEffect, useState } from 'react';
import { Music } from '../../../../../../shared/Music';
import styles from './Seek.module.scss';

export const Seek: FC<Props> = ({ activeMusic, progress }) => {
  const [readableDuration, setReadableDuration] = useState('');
  const readableTime = '00:00';

  useLayoutEffect(() => {
    setReadableDuration(
      activeMusic !== undefined
        ? dayjs(activeMusic.duration * 1000).format('mm:ss')
        : '00:00'
    );
  }, [activeMusic]);

  return (
    <>
      <div className={styles.seek}>
        <div className={styles.currentTime}>{readableTime}</div>
        <div
          className={styles.progressBar}
          onMouseDown={() => {}}
          role="progressbar"
          tabIndex={0}
        >
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={styles.duration}>{readableDuration}</div>
      </div>
    </>
  );
};

interface Props {
  activeMusic: Music | undefined;
  progress: number;
}
