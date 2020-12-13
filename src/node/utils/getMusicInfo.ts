import { createHash } from 'crypto';
import dayjs from 'dayjs';
import * as musicMetadata from 'music-metadata';

export async function getMusicInfo(path: string): Promise<any> {
  const { common, format } = await musicMetadata.parseFile(path);
  const {
    album,
    albumartist,
    artist,
    artists,
    comment,
    composer,
    disk,
    genre,
    picture,
    title,
    track,
    year,
  } = common;
  const { duration, sampleRate } = format;
  const readableDuration = dayjs((duration || 0) * 1000).format('mm:ss');
  const pathHash = createHash('md5').update(path).digest('hex');

  return {
    album,
    albumArtist: albumartist,
    artist,
    artists,
    comment,
    composer,
    disk,
    duration,
    genre,
    path,
    pathHash,
    picture,
    readableDuration,
    sampleRate,
    title,
    track,
    year,
  };
}
