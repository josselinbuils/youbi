import cn from 'classnames';
import React, { FC, HTMLAttributes } from 'react';
import { Music } from '../../../../../../../shared/interfaces/Music';
import styles from './AlbumMusic.module.scss';

export const AlbumMusic: FC<Props> = ({
  colorPalette,
  isActive,
  isPlayed,
  music,
  onClick,
  ...forwardedProp
}) => (
  <button
    className={styles.albumMusic}
    style={{
      background: isActive ? colorPalette[1] : undefined,
      color: colorPalette[isActive ? 0 : 1],
    }}
    onClick={onClick}
    type="button"
    {...forwardedProp}
  >
    {!isPlayed && <span className={styles.number}>{music.track.no}</span>}
    {isPlayed && (
      <i
        className={cn(styles.playing, 'fa', 'fa-volume-down')}
        aria-hidden="true"
      />
    )}
    <span className={styles.title}>{music.title}</span>
    <span className={styles.duration}>{music.readableDuration}</span>
  </button>
);

interface Props extends HTMLAttributes<HTMLButtonElement> {
  colorPalette: string[];
  isActive: boolean;
  isPlayed: boolean;
  music: Music;
}
