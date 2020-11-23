import cn from 'classnames';
import React, { FC } from 'react';
import styles from './MusicInfo.module.scss';
import { Music } from '../../../../../shared/Music';

export const MusicInfo: FC<Props> = ({ activeMusic }) => (
  <div className={styles.musicInfo}>
    <div
      className={cn(
        styles.preview,
        !activeMusic?.coverURL && [styles.defaultPreview, 'fa', 'fa-music']
      )}
      style={{
        backgroundImage: activeMusic?.coverURL
          ? `url(${activeMusic.coverURL})`
          : undefined,
      }}
    />
    <div className={styles.info}>
      {!!activeMusic && (
        <div>
          <div className={styles.name}>{activeMusic.title}</div>
          <div className={styles.artist}>{activeMusic.artist}</div>
        </div>
      )}
    </div>
  </div>
);

interface Props {
  activeMusic: Music | undefined;
}
