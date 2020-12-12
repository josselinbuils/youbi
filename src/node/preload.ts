import { contextBridge, remote } from 'electron';
import { SharedProperties } from '../shared/SharedProperties';
import {
  actions,
  GET_MUSIC_LIST,
  MUSIC_LIST,
  MusicListAction,
} from '../shared/actions';

const sharedProperties: SharedProperties = {
  getMusicList: async (path: string) => {
    actions.send({ type: GET_MUSIC_LIST, path });
    return (await actions.waitFor<MusicListAction>({ type: MUSIC_LIST }))
      .musics;
  },
  isWindowMaximized: () => remote.getCurrentWindow().isMaximized(),
  maximizeWindow: () => remote.getCurrentWindow().maximize(),
  openDevTools: () => remote.getCurrentWebContents().openDevTools(),
  unmaximizeWindow: () => remote.getCurrentWindow().unmaximize(),
};

contextBridge.exposeInMainWorld('remote', sharedProperties);
