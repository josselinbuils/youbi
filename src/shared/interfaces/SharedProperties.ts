import { BrowserWindow } from 'electron';

export interface SharedProperties {
  getCurrentElectronWindow?(): BrowserWindow;
}
