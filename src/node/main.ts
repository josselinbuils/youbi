import 'source-map-support/register';
import { app, BrowserWindow, protocol } from 'electron';
import electronWindowState from 'electron-window-state';
import { join } from 'path';
import { format } from 'url';
import { GET_MUSIC_LIST_ACTION, MUSIC_LIST_ACTION } from '../shared/actions';
import { actions } from './actions';
import { Browser } from './Browser';
import { Logger } from './Logger';

const logger = Logger.create('Main');

export class Main {
  private static mainWindow?: BrowserWindow;

  static init(): void {
    logger.debug('init()');

    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'music',
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      },
    ]);

    app.on('ready', () => {
      this.createMainWindow();

      const browser = Browser.create(app.getPath('userData'));

      actions.on('all', async (action) => {
        logger.debug(`Action received: ${action.type}`);

        try {
          switch (action.type) {
            case GET_MUSIC_LIST_ACTION: {
              const musics = await browser.getMusicList(action.path);
              actions.send({ type: MUSIC_LIST_ACTION, musics });
              break;
            }

            default:
              throw new Error(`Unknown action: ${action.type}`);
          }
        } catch (error) {
          logger.error(error);
        }
      });
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the dock
      // icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        Main.createMainWindow();
      }
    });

    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar to stay
      // active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  private static createMainWindow(): void {
    logger.debug('createMainWindow()');

    const mainWindowState = electronWindowState({
      defaultWidth: 900,
      defaultHeight: 600,
    });

    const { width, height } = mainWindowState;

    this.mainWindow = new BrowserWindow({
      width,
      height,
      minWidth: 900,
      minHeight: 600,
      // frame: false,
      backgroundColor: '#111625',
      titleBarStyle: 'hidden',
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: true,
        preload: join(__dirname, 'preload.js'),
      },
    });

    mainWindowState.manage(this.mainWindow);

    if (this.isDev()) {
      this.mainWindow.loadURL('http://localhost:3000', {
        extraHeaders: 'pragma: no-cache\n',
      });
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadURL(
        format({
          pathname: join(__dirname, '../browser/index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }

    this.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows in an
      // array if your app supports multi windows, this is the time when you
      // should delete the corresponding element.
      delete this.mainWindow;
    });
  }

  private static isDev(): boolean {
    return (
      process.defaultApp ||
      /node_modules[\\/]electron[\\/]/.test(process.execPath)
    );
  }
}

Main.init();
