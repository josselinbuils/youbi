import { RefObject } from 'react';
import { Music } from '../../../../../../shared/Music';
import { computeTileProperties } from '../../../utils/computeTileProperties';
import { Column } from '../interfaces/Column';

const COLUMN_MARGIN_PX = 50;
const MAX_COLUMNS_BY_ROW = 4;
const MIN_COLUMNS_BY_ROW = 1;
const PREFERRED_COLUMN_WIDTH_PX = 400;

export function computeColumns(
  detailsElementRef: RefObject<HTMLElement>,
  musics: Music[]
): Column[] {
  if (detailsElementRef.current === null) {
    return [];
  }

  const containerWidth = detailsElementRef.current.clientWidth;
  const { tilesByLine } = computeTileProperties(
    containerWidth,
    COLUMN_MARGIN_PX,
    PREFERRED_COLUMN_WIDTH_PX,
    MIN_COLUMNS_BY_ROW,
    MAX_COLUMNS_BY_ROW
  );
  const musicsByColumn = Math.ceil(musics.length / tilesByLine);
  const width = `calc(${(100 / tilesByLine).toFixed(2)}% - ${
    COLUMN_MARGIN_PX * 2
  }px)`;
  const columns = [];
  let start = 0;

  for (let i = 1; i <= tilesByLine; i++) {
    columns.push({
      musics: musics.slice(start, start + musicsByColumn),
      width,
    });
    start += musicsByColumn;
  }
  return columns;
}
