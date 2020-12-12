import { actions } from '../node/actions';

export interface SharedProperties {
  actions: typeof actions;
  isWindowMaximized(): boolean;
  maximizeWindow(): void;
  openDevTools(): void;
  unmaximizeWindow(): void;
}
