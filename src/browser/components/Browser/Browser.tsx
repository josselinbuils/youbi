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
import styles from './Browser.module.scss';
import { AlbumTile } from './components/AlbumTile/AlbumTile';
import { Letter } from './components/Letter/Letter';
import { Album } from './interfaces/Album';
import { computeTileSize } from './utils/computeTileSize';
import { getAlbums } from './utils/getAlbums';
import { AlbumDetails } from './components/AlbumDetails/AlbumDetails';
import { getColorPalette } from './utils/getColorPalette';

const TILE_MARGIN_PX = 20;
const MAX_TILES_BY_ROW = 30;
const MIN_TILES_BY_ROW = 2;
const PREFERRED_TILE_WIDTH_PX = 200;

export const Browser: FC<Props> = ({ className }) => {
  const [activeAlbum, setActiveAlbum] = useState<Album>();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [letter, setLetter] = useState<string>();
  const [tileSize, setTileSize] = useState(0);
  const [tileLines, setTileLines] = useState<Album[][]>([]);
  const browserElementRef = useRef<HTMLElement>(null);
  const cancellersRef = useRef<(() => void)[]>([]);

  function computeTileLines() {
    if (browserElementRef.current !== null) {
      const res = computeTileSize(
        browserElementRef.current.offsetWidth,
        TILE_MARGIN_PX,
        PREFERRED_TILE_WIDTH_PX,
        MIN_TILES_BY_ROW,
        MAX_TILES_BY_ROW
      );
      const linesCount = Math.ceil(albums.length / res.tilesByLine);

      if (linesCount !== tileLines.length) {
        const newTileLines = [];

        for (let i = 0; i < linesCount; i++) {
          newTileLines.push(
            albums.slice(i * res.tilesByLine, (i + 1) * res.tilesByLine)
          );
        }
        setTileLines(newTileLines);
      }
      setTileSize(res.tileSize);
    }
  }

  useEventListener('resize', computeTileLines);
  useLayoutEffect(computeTileLines, [albums, tileLines.length]);

  useEffect(() => {
    const [promise, cancel] = cancelable(getAlbums());
    promise.then(setAlbums);
    return cancel;
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

  useEffect(
    () => () => cancellersRef.current.forEach((cancel) => cancel()),
    []
  );

  return (
    <main className={cn(styles.browser, className)} ref={browserElementRef}>
      <Letter letter={letter} />
      {tileLines.map((lineAlbums) => (
        <Fragment key={lineAlbums[0].name}>
          <div>
            {lineAlbums.map((album) => (
              <AlbumTile
                album={album}
                isActive={album === activeAlbum}
                key={album.name}
                lineId={
                  activeAlbum
                    ? tileLines.find((line) => line.includes(activeAlbum))?.[0]
                        ?.name
                    : undefined
                }
                onClick={() => setAlbum(album)}
                onIntersect={() => setLetter(album.firstArtistLetter)}
                tileSize={tileSize}
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
