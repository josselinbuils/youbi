import cn from 'classnames';
import React, { FC } from 'react';
import { useAudio } from '../../../AudioProvider/useAudio';
import { SeekBar } from './SeekBar/SeekBar';
import { Button } from '../Button/Button';
import styles from './MusicControls.module.scss';

export const MusicControls: FC<Props> = ({ className }) => {
  const { audioController, audioState } = useAudio();
  const { next, play, prev, toggleRandom, toggleRepeat } = audioController;
  const { activeMusic, paused, random, repeat } = audioState;
  const isThereActiveMusic = activeMusic !== undefined;

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
          disabled={!isThereActiveMusic}
          onClick={prev}
        >
          <i aria-hidden="true" className="fas fa-step-backward" />
        </Button>
        <Button
          aria-label="play"
          className={styles.playButton}
          disabled={!isThereActiveMusic}
          onClick={play}
        >
          <i
            aria-hidden="true"
            className={cn('fa', paused ? 'fa-play-circle' : 'fa-pause-circle')}
          />
        </Button>
        <Button
          aria-label="next"
          className={styles.nextButton}
          disabled={!isThereActiveMusic}
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
