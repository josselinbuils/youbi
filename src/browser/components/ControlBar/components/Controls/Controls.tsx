import cn from 'classnames';
import React, { FC, useState } from 'react';
import styles from './Controls.module.scss';
import { PlayerState } from '../../../../../shared/constants';
import { Seek } from './Seek/Seek';
import { Music } from '../../../../../shared/interfaces/Music';

export const Controls: FC<Props> = ({ activeMusic }) => {
  const [random, setRandom] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const playerState = undefined;

  return (
    <div className={styles.controls}>
      <div>
        <button
          aria-label="toggle random"
          className={cn(styles.button, styles.randomButton, {
            [styles.checked]: random,
          })}
          onClick={() => setRandom(!random)}
          type="button"
        >
          <i className="fas fa-random" aria-hidden="true" />
        </button>
        <button
          aria-label="previous"
          className={cn(styles.button, styles.prevButton)}
          onClick={() => {}}
          type="button"
        >
          <i className="fas fa-step-backward" aria-hidden="true" />
        </button>
        <button
          aria-label="play"
          className={cn(styles.button, styles.playButton)}
          onClick={() => {}}
          type="button"
        >
          <i
            className={cn(
              'fa',
              playerState !== PlayerState.Playing
                ? 'fa-play-circle'
                : 'fa-pause-circle'
            )}
            aria-hidden="true"
          />
        </button>
        <button
          aria-label="next"
          className={cn(styles.button, styles.nextButton)}
          onClick={() => {}}
          type="button"
        >
          <i className="fas fa-step-forward" aria-hidden="true" />
        </button>
        <button
          aria-label="toggle repeat"
          className={cn(styles.button, styles.repeatButton, {
            [styles.checked]: repeat,
          })}
          onClick={() => setRepeat(!repeat)}
          type="button"
        >
          <i className="fas fa-redo" aria-hidden="true" />
        </button>
      </div>
      <Seek activeMusic={activeMusic} progress={0} />
    </div>
  );
};

interface Props {
  activeMusic: Music | undefined;
}
