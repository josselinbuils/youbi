export interface SharedProperties {
  getMusicList(path: string): Promise<any>;
  isWindowMaximized(): boolean;
  maximizeWindow(): void;
  openDevTools(): void;
  unmaximizeWindow(): void;
}
