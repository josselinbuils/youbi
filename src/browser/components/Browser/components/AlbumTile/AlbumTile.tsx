import cn from 'classnames';
import React, { FC, HTMLAttributes, useEffect, useRef } from 'react';
import { Album } from '../../interfaces/Album';
import styles from './AlbumTile.module.scss';
import { useIntersect } from '../../hooks/useIntersectionObserver';

export const AlbumTile: FC<Props> = ({
  album,
  isActive,
  lineId,
  onIntersect,
  tileSize,
  ...forwardedProps
}) => {
  const ref = useRef(null);
  const previousLineIdRef = useRef<string>();
  const { colorPalette, coverURL } = album;
  const noTransition = lineId === previousLineIdRef.current;

  useIntersect(ref, onIntersect);

  useEffect(() => {
    previousLineIdRef.current = lineId;
  }, [album, lineId]);

  return (
    <div
      className={cn(
        styles.albumTile,
        !coverURL && [styles.defaultPreview, 'fa', 'fa-music']
      )}
      ref={ref}
      style={{
        backgroundImage: coverURL ? `url(${coverURL})` : undefined,
        width: tileSize,
        height: tileSize,
      }}
      {...forwardedProps}
    >
      <div
        className={cn(styles.caret, {
          [styles.noTransition]: noTransition,
          [styles.shown]: isActive && !!colorPalette,
        })}
        style={{ borderBottomColor: colorPalette?.[0] }}
      >
        <div className={styles.caretInner} />
      </div>
    </div>
  );
};

interface Props extends HTMLAttributes<HTMLDivElement> {
  album: Album;
  isActive: boolean;
  lineId: string | undefined;
  tileSize: number;
  onIntersect(): unknown;
}
