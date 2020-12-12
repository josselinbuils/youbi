import React, { createRef, FC } from 'react';
import { useAudio } from '../../../../AudioProvider/useAudio';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { ProgressBar } from '../../ProgressBar/ProgressBar';

export const VolumeBar: FC<Props> = ({ className }) => {
  const progressBarRef = createRef<HTMLDivElement>();
  const seekStartHandler = useDragAndDrop(onSeekStart);
  const {
    audioController: { setVolume },
    audioState: { volume },
  } = useAudio();

  function onSeekStart(
    downEvent: React.MouseEvent
  ): ((moveEvent: MouseEvent) => void) | void {
    if (progressBarRef.current === null) {
      return;
    }

    const progressBarWidth = progressBarRef.current.clientWidth;
    const dx = downEvent.nativeEvent.offsetX - downEvent.clientX;

    setVolume((downEvent.nativeEvent.offsetX / progressBarWidth) ** 2);

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
    />
  );
};

interface Props {
  className?: string;
}
