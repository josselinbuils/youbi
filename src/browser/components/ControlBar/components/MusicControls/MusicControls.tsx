import cn from 'classnames';
import React, { FC, useEffect } from 'react';
import { useAudio } from '../../../AudioProvider/useAudio';
import { SeekBar } from './SeekBar/SeekBar';
import { Button } from '../Button/Button';
import styles from './MusicControls.module.scss';
import { SharedProperties } from '../../../../../shared/SharedProperties';

export const MusicControls: FC<Props> = ({ className }) => {
  const { audioController, audioState } = useAudio();
  const { next, play, prev, toggleRandom, toggleRepeat } = audioController;
  const { paused, random, repeat } = audioState;

  useEffect(() => {
    (window.remote as SharedProperties).onGlobalShortcut(
      console.log.bind(console)
    );
  }, []);

  return (
    <div className={cn(styles.controls, className)}>
      <div>
        <Button
          aria-label="toggle random"
          checked={random}
          className={styles.randomButton}
          onClick={toggleRandom}
        >
          <i aria-hidden="true" className="fas fa-random" />
        </Button>
        <Button
          aria-label="previous"
          className={styles.prevButton}
          onClick={prev}
        >
          <i aria-hidden="true" className="fas fa-step-backward" />
        </Button>
        <Button aria-label="play" className={styles.playButton} onClick={play}>
          <i
            aria-hidden="true"
            className={cn('fa', paused ? 'fa-play-circle' : 'fa-pause-circle')}
          />
        </Button>
        <Button
          aria-label="next"
          className={styles.nextButton}
          onClick={() => next()}
        >
          <i aria-hidden="true" className="fas fa-step-forward" />
        </Button>
        <Button
          aria-label="toggle repeat"
          checked={repeat}
          className={styles.repeatButton}
          onClick={toggleRepeat}
        >
          <i aria-hidden="true" className="fas fa-redo" />
        </Button>
      </div>
      <SeekBar />
    </div>
  );
};

interface Props {
  className: string;
}
