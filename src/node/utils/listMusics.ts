import { lstatSync, readdir } from 'fs-extra';
import { join } from 'path';
import { isMusicSupported } from './isMusicSupported';

export async function listMusics(path: string): Promise<string[]> {
  if (lstatSync(path).isDirectory()) {
    const res = [] as string[];

    const filePromises = (await readdir(path)).map(async (dir) =>
      listMusics(join(path, dir))
    );

    (await Promise.all(filePromises)).forEach((a) => res.push(...a));

    return res.filter(isMusicSupported);
  }
  return [path];
}
