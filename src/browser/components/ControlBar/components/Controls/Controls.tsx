import cn from 'classnames';
import React, { FC } from 'react';
import { useAudio } from '../../../AudioProvider/useAudio';
import styles from './Controls.module.scss';
import { Seek } from './Seek/Seek';

export const Controls: FC = () => {
  const { audioController, audioState } = useAudio();

  const { next, play, prev, toggleRandom, toggleRepeat } = audioController;
  const { activeMusic, paused, random, repeat } = audioState;

  return (
    <div className={styles.controls}>
      <div>
        <button
          aria-label="toggle random"
          className={cn(styles.button, styles.randomButton, {
            [styles.checked]: random,
          })}
          onClick={toggleRandom}
          type="button"
        >
          <i aria-hidden="true" className="fas fa-random" />
        </button>
        <button
          aria-label="previous"
          className={cn(styles.button, styles.prevButton)}
          onClick={prev}
          type="button"
        >
          <i aria-hidden="true" className="fas fa-step-backward" />
        </button>
        <button
          aria-label="play"
          className={cn(styles.button, styles.playButton)}
          onClick={play}
          type="button"
        >
          <i
            aria-hidden="true"
            className={cn('fa', paused ? 'fa-play-circle' : 'fa-pause-circle')}
          />
        </button>
        <button
          aria-label="next"
          className={cn(styles.button, styles.nextButton)}
          onClick={next}
          type="button"
        >
          <i aria-hidden="true" className="fas fa-step-forward" />
        </button>
        <button
          aria-label="toggle repeat"
          className={cn(styles.button, styles.repeatButton, {
            [styles.checked]: repeat,
          })}
          onClick={toggleRepeat}
          type="button"
        >
          <i aria-hidden="true" className="fas fa-redo" />
        </button>
      </div>
      <Seek activeMusic={activeMusic} progress={0} />
    </div>
  );
};
