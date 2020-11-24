import cn from 'classnames';
import React, { FC } from 'react';
import styles from './MusicInfo.module.scss';
import { useAudio } from '../../../AudioProvider/useAudio';

export const MusicInfo: FC = () => {
  const { audioState } = useAudio();
  const { activeMusic } = audioState;

  return (
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
      {!!activeMusic && (
        <div className={styles.info}>
          <div className={styles.name}>{activeMusic.title}</div>
          <div className={styles.artist}>{activeMusic.artist}</div>
        </div>
      )}
    </div>
  );
};
