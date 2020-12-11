import cn from 'classnames';
import React, { FC } from 'react';
import { useAudio } from '../../../AudioProvider/useAudio';
import styles from './MusicInfo.module.scss';

export const MusicInfo: FC<Props> = ({ className }) => {
  const { audioState } = useAudio();
  const { activeMusic } = audioState;

  return (
    <div className={cn(styles.musicInfo, className)}>
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

interface Props {
  className: string;
}
