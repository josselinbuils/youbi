export interface TileProperties {
  tilesByLine: number;
  tileSize: number;
}

export function computeTileProperties(
  containerWidth: number,
  tileMargin: number,
  preferredItemWidth: number,
  minItemsByRow: number,
  maxItemsByRow: number
): TileProperties {
  const dWidths: number[] = [];
  let tilesByLine: number | undefined;
  let tileSize: number | undefined;

  for (let i = minItemsByRow; i <= maxItemsByRow; i++) {
    const width = Math.floor((containerWidth - (i + 1) * tileMargin) / i);

    dWidths[i] = Math.abs(width - preferredItemWidth);

    if (i === minItemsByRow || (width > 0 && dWidths[i] < dWidths[i - 1])) {
      tileSize = width;
      tilesByLine = i;
    }
  }

  if (tilesByLine === undefined || tileSize === undefined) {
    throw new Error('Unable to compute tile size');
  }

  return { tilesByLine, tileSize };
}
