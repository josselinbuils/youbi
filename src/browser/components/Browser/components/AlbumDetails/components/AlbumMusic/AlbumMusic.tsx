import cn from 'classnames';
import React, { FC, HTMLAttributes } from 'react';
import { Music } from '../../../../../../../shared/Music';
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
    {isPlayed && (
      <i
        aria-hidden="true"
        className={cn('fa', 'fa-volume-up', styles.playing)}
        style={{ color: colorPalette[1] }}
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
