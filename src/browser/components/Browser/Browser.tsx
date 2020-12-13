import { useEventListener } from '@josselinbuils/hooks/useEventListener';
import cn from 'classnames';
import React, {
  FC,
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cancelable } from '../../utils/cancelable';
import { AlbumTile } from './components/AlbumTile/AlbumTile';
import { Letter } from './components/Letter/Letter';
import { Album } from './interfaces/Album';
import {
  computeTileProperties,
  TileProperties,
} from './utils/computeTileProperties';
import { getAlbums } from './utils/getAlbums';
import { AlbumDetails } from './components/AlbumDetails/AlbumDetails';
import { getColorPalette } from './utils/getColorPalette';
import styles from './Browser.module.scss';
import { SharedProperties } from '../../../shared/SharedProperties';
import {
  GET_MUSIC_LIST_ACTION,
  MUSIC_LIST_ACTION,
  MusicListAction,
} from '../../../shared/actions';

const LETTER_HIDE_DELAY_MS = 500;
const MAX_TILES_BY_ROW = 30;
const MIN_TILES_BY_ROW = 2;
const PREFERRED_TILE_WIDTH_PX = 200;
const TILE_MARGIN_PX = 20;

export const Browser: FC<Props> = ({ className }) => {
  const [activeAlbum, setActiveAlbum] = useState<Album>();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [letter, setLetter] = useState<string>();
  const [tileProperties, setTileProperties] = useState<TileProperties>();
  const [tileLines, setTileLines] = useState<Album[][]>([]);
  const browserElementRef = useRef<HTMLElement>(null);
  const cancellersRef = useRef<(() => void)[]>([]);
  const hideLetterTimeoutRef = useRef<number>();

  function computeAndSetTilesProperties() {
    if (browserElementRef.current !== null) {
      setTileProperties(
        computeTileProperties(
          browserElementRef.current.offsetWidth,
          TILE_MARGIN_PX,
          PREFERRED_TILE_WIDTH_PX,
          MIN_TILES_BY_ROW,
          MAX_TILES_BY_ROW
        )
      );
    }
  }

  useEventListener('resize', computeAndSetTilesProperties);

  useLayoutEffect(() => {
    if (tileProperties === undefined) {
      return;
    }
    const { tilesByLine } = tileProperties;
    const linesCount = Math.ceil(albums.length / tilesByLine);
    const newTileLines = [];

    for (let i = 0; i < linesCount; i++) {
      newTileLines.push(albums.slice(i * tilesByLine, (i + 1) * tilesByLine));
    }
    setTileLines(newTileLines);
  }, [albums, tileProperties]);

  useEffect(() => {
    const { actions } = window.remote as SharedProperties;

    const musicListListener = ({ musics }: MusicListAction) => {
      setAlbums(getAlbums(musics));
    };

    actions.on<MusicListAction>(MUSIC_LIST_ACTION, musicListListener);
    actions.send({ type: GET_MUSIC_LIST_ACTION });
    computeAndSetTilesProperties();

    return () => {
      actions.off(MUSIC_LIST_ACTION, musicListListener);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cancellersRef.current.forEach((cancel) => cancel());
    };
  }, []);

  function setAlbum(album: Album) {
    if (album === activeAlbum) {
      setActiveAlbum(undefined);
    } else if (album.colorPalette === undefined) {
      const cancellers = cancellersRef.current;
      const [promise, cancel] = cancelable(getColorPalette(album.coverURL));

      promise.then((palette) => {
        album.colorPalette = palette;
        cancellers.splice(cancellers.indexOf(cancel), 1);
        setActiveAlbum(album);
      });
      cancellers.push(cancel);
    } else {
      setActiveAlbum(album);
    }
  }

  return (
    <main className={cn(styles.browser, className)} ref={browserElementRef}>
      <Letter letter={letter} />
      {tileProperties &&
        tileLines.map((lineAlbums) => (
          <Fragment key={lineAlbums[0].name}>
            <div className={styles.line}>
              {lineAlbums.map((album) => (
                <AlbumTile
                  album={album}
                  isActive={album === activeAlbum}
                  key={album.name}
                  lineId={
                    activeAlbum
                      ? tileLines.find((line) =>
                          line.includes(activeAlbum)
                        )?.[0]?.name
                      : undefined
                  }
                  onClick={() => setAlbum(album)}
                  onIntersect={() => {
                    setLetter(album.firstArtistLetter);

                    if (hideLetterTimeoutRef.current !== undefined) {
                      window.clearTimeout(hideLetterTimeoutRef.current);
                    }
                    hideLetterTimeoutRef.current = window.setTimeout(() => {
                      setLetter(undefined);
                      hideLetterTimeoutRef.current = undefined;
                    }, LETTER_HIDE_DELAY_MS);
                  }}
                  tileSize={tileProperties.tileSize}
                />
              ))}
            </div>
            <AlbumDetails
              album={
                !!activeAlbum && lineAlbums.includes(activeAlbum)
                  ? activeAlbum
                  : undefined
              }
            />
          </Fragment>
        ))}
    </main>
  );
};

interface Props {
  className: string;
}
