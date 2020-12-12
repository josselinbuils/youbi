import {
  GET_MUSIC_LIST_ACTION,
  MUSIC_LIST_ACTION,
  MusicListAction,
} from '../../../../shared/actions';
import { SharedProperties } from '../../../../shared/SharedProperties';
import { Album } from '../interfaces/Album';
import { groupBy } from './groupBy';

export async function getAlbums(): Promise<Album[]> {
  const { actions } = window.remote as SharedProperties;
  actions.send({
    type: GET_MUSIC_LIST_ACTION,
    path: '/Volumes/music',
  });
  const { musics: rawMusics } = await actions.waitFor<MusicListAction>(
    MUSIC_LIST_ACTION
  );
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
