import { contextBridge, remote } from 'electron';
import * as ipc from 'ipc-promise';
import { SharedProperties } from '../shared/SharedProperties';

const sharedProperties: SharedProperties = {
  getMusicList: async (path: string) =>
    ipc.send('browser', { name: 'getMusicList', args: [path] }),
  isWindowMaximized: () => remote.getCurrentWindow().isMaximized(),
  maximizeWindow: () => remote.getCurrentWindow().maximize(),
  openDevTools: () => remote.getCurrentWebContents().openDevTools(),
  unmaximizeWindow: () => remote.getCurrentWindow().unmaximize(),
};

contextBridge.exposeInMainWorld('remote', sharedProperties);
