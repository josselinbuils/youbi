import React, { FC, useRef, useState } from 'react';
import { useAudio } from '../../../../AudioProvider/useAudio';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { ProgressBar } from '../../ProgressBar/ProgressBar';
import styles from './SeekBar.module.scss';

export const SeekBar: FC = () => {
  const [seeking, setSeeking] = useState(false);
  const { audioController, audioState } = useAudio();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const seekStartHandler = useDragAndDrop(onSeekStart, () => setSeeking(false));
  const { setCurrentTime } = audioController;
  const { activeMusic, currentTime, progress } = audioState;

  function onSeekStart(
    downEvent: React.MouseEvent
  ): ((moveEvent: MouseEvent) => void) | void {
    if (progressBarRef.current === null || activeMusic === undefined) {
      return;
    }

    const progressBarWidth = progressBarRef.current.clientWidth;
    const dx = downEvent.nativeEvent.offsetX - downEvent.clientX;

    setCurrentTime(downEvent.nativeEvent.offsetX / progressBarWidth);
    setSeeking(true);

    return (moveEvent: MouseEvent) =>
      setCurrentTime(
        Math.max(
          Math.min(moveEvent.clientX + dx, progressBarWidth * 0.999),
          0
        ) / progressBarWidth
      );
  }

  return (
    <div className={styles.seekBar}>
      <time className={styles.currentTime}>{currentTime}</time>
      <ProgressBar
        disabled={activeMusic === undefined}
        onSeekStart={seekStartHandler}
        progress={progress}
        ref={progressBarRef}
        seeking={seeking}
      />
      <time className={styles.duration}>
        {activeMusic ? activeMusic.readableDuration : '00:00'}
      </time>
    </div>
  );
};
