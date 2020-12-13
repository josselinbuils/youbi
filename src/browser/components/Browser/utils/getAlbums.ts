import { Music } from '../../../../shared/Music';
import { Album } from '../interfaces/Album';
import { groupBy } from './groupBy';

export function getAlbums(rawMusics: Music[]): Album[] {
  const musicsByAlbum = groupBy(rawMusics, 'album');

  return Object.entries(musicsByAlbum)
    .map(([name, musics]) => {
      const { albumArtist, coverURL, year } = musics[0];
      const artist = albumArtist !== undefined ? albumArtist : musics[0].artist;
      const firstArtistLetter = artist
        .slice(0, 1)
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return { artist, coverURL, firstArtistLetter, musics, name, year };
    })
    .sort((a, b) => {
      const artistComparison = a.artist.localeCompare(b.artist);
      return artistComparison !== 0
        ? artistComparison
        : a.name.localeCompare(b.name);
    });
}
