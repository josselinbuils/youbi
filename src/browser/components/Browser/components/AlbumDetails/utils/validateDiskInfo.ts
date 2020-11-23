import { Music } from '../../../../../../shared/Music';

export function validateDiskInfo(musics: Music[]): boolean {
  return !musics.some(
    (music) =>
      typeof music.disk.no !== 'number' || typeof music.disk.of !== 'number'
  );
}
