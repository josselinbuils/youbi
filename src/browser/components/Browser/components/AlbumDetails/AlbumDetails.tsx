import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { Music } from '../../../../../shared/Music';
import { useHeightTransition } from '../../../../hooks/useHeightTransition';
import { useAudio } from '../../../AudioProvider/useAudio';
import { Album } from '../../interfaces/Album';
import { AlbumMusic } from './components/AlbumMusic/AlbumMusic';
import { Column } from './interfaces/Column';
import { computeColumns } from './utils/computeColumns';
import { validateDiskInfo } from './utils/validateDiskInfo';
import styles from './AlbumDetails.module.scss';

export const AlbumDetails: FC<Props> = ({ album }) => {
  const [activeAlbum, setActiveAlbum] = useState<Album>();
  const [activeMusic, setActiveMusic] = useState<Music>();
  const [disks, setDisks] = useState<Column[][]>([]);
  const [height, setHeight] = useState(0);
  const detailsElementRef = useRef<HTMLDivElement>(null);
  const innerElementRef = useRef<HTMLDivElement>(null);
  const { audioController } = useAudio();
  const { style, transitionState } = useHeightTransition(!!album, height, {
    closeDelayMs: 25,
    closeDurationMs: 125,
    openDelayMs: 25,
    openDurationMs: 125,
  });

  const { playMusic, setPlaylist } = audioController;

  useLayoutEffect(() => {
    if (album !== undefined) {
      setActiveAlbum(album);
    }
  }, [album]);

  useLayoutEffect(() => {
    if (album === undefined || transitionState !== 'createDom') {
      return;
    }
    const { musics } = album;
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
  }, [album, transitionState]);

  useLayoutEffect(() => {
    setHeight(
      (detailsElementRef.current?.getBoundingClientRect()?.height || 0) +
        (innerElementRef.current?.clientHeight || 0)
    );
  }, [disks]);

  useLayoutEffect(() => {
    if (transitionState === 'closed' && height > 0) {
      setHeight(0);
    }
  }, [height, transitionState]);

  return transitionState !== 'closed' ? (
    <div className={cn(styles.details)} ref={detailsElementRef} style={style}>
      {activeAlbum?.colorPalette ? (
        <div
          className={styles.inner}
          ref={innerElementRef}
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
  ) : null;
};

interface Props {
  album: Album | undefined;
}
