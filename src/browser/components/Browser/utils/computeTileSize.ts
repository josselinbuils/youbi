export function computeTileSize(
  containerWidth: number,
  itemMargin: number,
  preferredItemWidth: number,
  minItemsByRow: number,
  maxItemsByRow: number
): { lineWidth: number; tilesByLine: number; tileSize: number } {
  const dWidths: number[] = [];
  let tilesByLine: number | undefined;
  let tileSize: number | undefined;
  let lineWidth: number | undefined;

  for (let i = minItemsByRow; i <= maxItemsByRow; i++) {
    const width = Math.floor((containerWidth - (i + 1) * itemMargin) / i);

    dWidths[i] = Math.abs(width - preferredItemWidth);

    if (i === minItemsByRow || (width > 0 && dWidths[i] < dWidths[i - 1])) {
      tileSize = width;
      tilesByLine = i;
      lineWidth = width * i + (i - 1) * itemMargin;
    }
  }

  if (
    tilesByLine === undefined ||
    tileSize === undefined ||
    lineWidth === undefined
  ) {
    throw new Error('Unable to compute tile size');
  }

  return { lineWidth, tilesByLine, tileSize };
}
