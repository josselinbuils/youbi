import { ipcMain, ipcRenderer, webContents } from 'electron';
import { Music } from './Music';

const ACTION_CHANNEL = 'action';
export const GET_MUSIC_LIST = 'GET_MUSIC_LIST';
export const MUSIC_LIST = 'MUSIC_LIST';

export interface GetMusicListAction {
  type: typeof GET_MUSIC_LIST;
  path: string;
}

export interface MusicListAction {
  type: typeof MUSIC_LIST;
  musics: Music[];
}

export type Action = GetMusicListAction | MusicListAction;

function on(callback: (action: Action) => unknown): void {
  const ipcCallback = (_: unknown, action: Action) => callback(action);

  if (typeof window !== 'undefined') {
    ipcRenderer.on(ACTION_CHANNEL, ipcCallback);
  } else {
    ipcMain.on(ACTION_CHANNEL, ipcCallback);
  }
}

function send(action: Action): void {
  if (typeof window !== 'undefined') {
    ipcRenderer.send(ACTION_CHANNEL, action);
  } else {
    webContents
      .getAllWebContents()
      .forEach((contents) => contents.send(ACTION_CHANNEL, action));
  }
}

function waitFor<T extends Action>({ type }: Pick<T, 'type'>): Promise<T> {
  return new Promise((resolve) => {
    on((action) => {
      if (action.type === type) {
        resolve(action as T);
      }
    });
  });
}

export const actions = { on, send, waitFor };
