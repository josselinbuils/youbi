import { remote } from 'electron';
import * as ipc from 'ipc-promise';
import { SharedProperties } from '../shared/interfaces/SharedProperties';

process.once('loaded', () => {
  (global as any).ipc = ipc;
  (global as SharedProperties).getCurrentElectronWindow =
    remote.getCurrentWindow;
});
