import { remote } from 'electron';
import * as ipc from 'ipc-promise';

process.once('loaded', () => {
  (global as any).ipc = ipc;
  (global as any).getCurrentElectronWindow = remote.getCurrentWindow;
});
