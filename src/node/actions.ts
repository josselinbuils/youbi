import { ipcMain, ipcRenderer, webContents } from 'electron';
import { Action } from '../shared/actions';

const ACTION_CHANNEL = 'action';
const callbackMaps: {
  callback: (...args: any[]) => any;
  ipcCallback: (...args: any[]) => any;
}[] = [];

function off(type: string, callback: (...args: any[]) => unknown): void {
  const callbacks = callbackMaps.find(({ callback: c }) => c === callback);

  if (callbacks === undefined) {
    throw new Error(`Cannot remove unknown callback: ${callback.toString()}`);
  }
  if (typeof window !== 'undefined') {
    ipcRenderer.removeListener(ACTION_CHANNEL, callbacks.ipcCallback);
  } else {
    ipcMain.removeListener(ACTION_CHANNEL, callbacks.ipcCallback);
  }
}

function on<T extends Action>(
  type: string,
  callback: (action: T) => unknown
): void {
  const ipcCallback = (_: unknown, action: Action) => {
    if (action.type === type || type === 'all') {
      callback(action as T);
    }
  };

  callbackMaps.push({ callback, ipcCallback });

  if (typeof window !== 'undefined') {
    ipcRenderer.on(ACTION_CHANNEL, ipcCallback);
  } else {
    ipcMain.on(ACTION_CHANNEL, ipcCallback);
  }
}

function once<T extends Action>(
  type: string,
  callback: (action: T) => unknown
): void {
  const ipcCallback = (_: unknown, action: Action) => {
    if (action.type === type || type === 'all') {
      callback(action as T);
    }
  };

  if (typeof window !== 'undefined') {
    ipcRenderer.once(ACTION_CHANNEL, ipcCallback);
  } else {
    ipcMain.once(ACTION_CHANNEL, ipcCallback);
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

function waitFor<T extends Action>(type: string): Promise<T> {
  return new Promise((resolve) => once(type, resolve as any));
}

export const actions = { off, on, once, send, waitFor };
