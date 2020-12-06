import cn from 'classnames';
import React, { FC } from 'react';
import { useAudio } from '../../../AudioProvider/useAudio';
import { SeekBar } from './SeekBar/SeekBar';
import { Button } from '../Button/Button';
import styles from './Controls.module.scss';

export const Controls: FC = () => {
  const { audioController, audioState } = useAudio();

  const { next, play, prev, toggleRandom, toggleRepeat } = audioController;
  const { paused, random, repeat } = audioState;

  return (
    <div className={styles.controls}>
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
