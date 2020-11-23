import React, { createRef, FC } from 'react';
import { ProgressBar } from './ProgressBar';
import { useDragAndDrop } from './useDragAndDrop';

import styles from './SeekBar.module.scss';
import { useAudio } from '../../../../AudioProvider/useAudio';

export const SeekBar: FC = () => {
  const { audioController, audioState } = useAudio();
  const progressBarRef = createRef<HTMLDivElement>();
  const seekStartHandler = useDragAndDrop(onSeekStart);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

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

    return (moveEvent: MouseEvent) =>
      setCurrentTime((moveEvent.clientX + dx) / progressBarWidth);
  }

  return (
    <div className={styles.seekBar}>
      <time className={styles.currentTime}>{currentTime}</time>
      <ProgressBar
        progress={progress}
        onSeekStart={seekStartHandler}
        ref={progressBarRef}
      />
      <time className={styles.duration}>
        {activeMusic ? activeMusic.readableDuration : '00:00'}
      </time>
    </div>
  );
};
