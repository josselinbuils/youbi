import { Music } from '../../../../shared/Music';

export interface Album {
  artist: string;
  colorPalette?: string[];
  coverURL?: string;
  firstArtistLetter?: string;
  musics: Music[];
  name: string;
  year?: number;
}
