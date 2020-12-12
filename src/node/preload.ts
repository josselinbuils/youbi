import { contextBridge, remote } from 'electron';
import { SharedProperties } from '../shared/SharedProperties';
import { actions } from './actions';

const sharedProperties: SharedProperties = {
  actions,
  isWindowMaximized: () => remote.getCurrentWindow().isMaximized(),
  maximizeWindow: () => remote.getCurrentWindow().maximize(),
  openDevTools: () => remote.getCurrentWebContents().openDevTools(),
  unmaximizeWindow: () => remote.getCurrentWindow().unmaximize(),
};

contextBridge.exposeInMainWorld('remote', sharedProperties);
