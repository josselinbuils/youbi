import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { Music } from '../../../../../shared/Music';
import { cancelable } from '../../../../utils/cancelable';
import { useAudio } from '../../../AudioProvider/useAudio';
import { Album } from '../../interfaces/Album';
import styles from './AlbumDetails.module.scss';
import { AlbumMusic } from './components/AlbumMusic/AlbumMusic';
import { Column } from './interfaces/Column';
import { computeColumns } from './utils/computeColumns';
import { delay } from './utils/delay';
import { validateDiskInfo } from './utils/validateDiskInfo';

const HIDE_DELAY_MS = 500;

export const AlbumDetails: FC<Props> = ({ album }) => {
  const [activeAlbum, setActiveAlbum] = useState<Album>();
  const [activeMusic, setActiveMusic] = useState<Music>();
  const [disks, setDisks] = useState<Column[][]>([]);
  const detailsElementRef = useRef(null);
  const { audioController } = useAudio();

  const { playMusic, setPlaylist } = audioController;

  useLayoutEffect(() => {
    if (album !== undefined) {
      setActiveAlbum(album);
    } else {
      const [promise, cancel] = cancelable(delay(HIDE_DELAY_MS));
      promise.then(setActiveAlbum);
      return cancel;
    }
  }, [album]);

  useLayoutEffect(() => {
    if (activeAlbum === undefined) {
      return;
    }
    const { musics } = activeAlbum;
    const newDisks = [] as Column[][];

    if (musics.length > 0 && validateDiskInfo(musics)) {
      const diskCount = musics[0].disk.of ?? 1;

      for (let i = 1; i <= diskCount; i++) {
        const diskMusics = musics.filter((music) => music.disk.no === i);
        newDisks.push(computeColumns(detailsElementRef, diskMusics));
      }
    } else {
      newDisks.push(computeColumns(detailsElementRef, musics));
    }
    setDisks(newDisks);
  }, [activeAlbum]);

  return (
    <div
      className={cn(styles.details, { [styles.active]: !!album })}
      ref={detailsElementRef}
    >
      {activeAlbum?.colorPalette ? (
        <div
          className={styles.inner}
          style={{ background: activeAlbum.colorPalette[0] }}
        >
          <div
            style={{ color: activeAlbum.colorPalette[1] }}
            className={styles.header}
          >
            <h2>{activeAlbum.name}</h2>
            <h4>
              {activeAlbum.artist}
              {activeAlbum.year && <span> ({activeAlbum.year})</span>}
            </h4>
          </div>
          {disks.map((disk, diskIndex) => (
            <div
              className={styles.disk}
              // eslint-disable-next-line react/no-array-index-key
              key={`${activeAlbum.name}_${diskIndex}`}
            >
              {disk.map((column, columnIndex) => (
                <div
                  className={styles.column}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${activeAlbum.name}_${diskIndex}_${columnIndex}`}
                  style={{ width: column.width }}
                >
                  {column.musics.map((music) => (
                    <AlbumMusic
                      colorPalette={activeAlbum.colorPalette as string[]}
                      key={music.title}
                      isActive={music === activeMusic}
                      music={music}
                      onClick={async () => {
                        setPlaylist(activeAlbum.musics);
                        await playMusic(music);
                      }}
                      onMouseLeave={() => setActiveMusic(undefined)}
                      onMouseOver={() => setActiveMusic(music)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

interface Props {
  album: Album | undefined;
}
