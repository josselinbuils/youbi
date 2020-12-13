import React, { FC, useRef, useState } from 'react';
import { useAudio } from '../../../../AudioProvider/useAudio';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { ProgressBar } from '../../ProgressBar/ProgressBar';

export const VolumeBar: FC<Props> = ({ className }) => {
  const [seeking, setSeeking] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const seekStartHandler = useDragAndDrop(onSeekStart, () => setSeeking(false));
  const { audioController, audioState } = useAudio();
  const { setVolume } = audioController;
  const { volume } = audioState;

  function onSeekStart(
    downEvent: React.MouseEvent
  ): ((moveEvent: MouseEvent) => void) | void {
    if (progressBarRef.current === null) {
      return;
    }

    const progressBarWidth = progressBarRef.current.clientWidth;
    const dx = downEvent.nativeEvent.offsetX - downEvent.clientX;

    setVolume((downEvent.nativeEvent.offsetX / progressBarWidth) ** 2);
    setSeeking(true);

    return (moveEvent) => {
      setVolume(
        (Math.max(Math.min(moveEvent.clientX + dx, progressBarWidth), 0) /
          progressBarWidth) **
          2
      );
    };
  }

  return (
    <ProgressBar
      className={className}
      progress={Math.sqrt(volume) * 100}
      onSeekStart={seekStartHandler}
      ref={progressBarRef}
      seeking={seeking}
    />
  );
};

interface Props {
  className?: string;
}
