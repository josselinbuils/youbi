import ColorThief from 'color-thief-browser';

const colorThief = new ColorThief();
const cache = {} as { [coverURL: string]: string[] };
const defaultColorPalette = ['#293559', '#dee3f0'];

export async function getColorPalette(
  coverURL: string | undefined
): Promise<string[]> {
  if (coverURL === undefined) {
    return [...defaultColorPalette];
  }

  if (cache[coverURL] === undefined) {
    cache[coverURL] = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () =>
        resolve(
          colorThief
            .getPalette(img, 2)
            .map((rgb: string[]) => `rgb(${rgb.join(', ')})`)
        );
      img.crossOrigin = 'anonymous';
      img.src = coverURL;
    });
  }
  return cache[coverURL];
}
