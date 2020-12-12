import { Music } from './Music';

export const ERROR_ACTION = 'ERROR_ACTION';
export const GET_MUSIC_LIST_ACTION = 'GET_MUSIC_LIST_ACTION';
export const MUSIC_LIST_ACTION = 'MUSIC_LIST_ACTION';

export interface ErrorAction {
  type: typeof ERROR_ACTION;
  error: Error;
}

export interface GetMusicListAction {
  type: typeof GET_MUSIC_LIST_ACTION;
  path: string;
}

export interface MusicListAction {
  type: typeof MUSIC_LIST_ACTION;
  musics: Music[];
}

export type Action = ErrorAction | GetMusicListAction | MusicListAction;
