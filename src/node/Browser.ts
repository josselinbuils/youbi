import { Subject } from '@josselinbuils/utils/Subject';
import { createHash } from 'crypto';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { protocol } from 'electron';
import { pathExistsSync } from 'fs-extra';
import jimp from 'jimp';
import { join } from 'path';
import { Music } from '../shared/Music';
import { COVERS_FOLDER } from './constants';
import { LastfmAPI } from './LastfmAPI';
import { Logger } from './Logger';
import { Store } from './Store';
import { getMusicInfo } from './utils/getMusicInfo';
import { validate } from './validate';
import { listMusics } from './utils/listMusics';
import { PromiseQueue } from './PromiseQueue';

dayjs.extend(relativeTime);

const MUSIC_LIST = 'musicList';

interface MusicList {
  folderPath: string;
  musicPaths?: string[];
  musics?: Music[];
}

export class Browser {
  private coversPath = join(this.appPathData, COVERS_FOLDER);

  static create(appDataPath: string): Browser {
    return new Browser(
      appDataPath,
      Logger.create('Browser'),
      LastfmAPI.create(),
      Store.getInstance(),
      PromiseQueue.create(3)
    );
  }

  async getMusicList(onUpdate: (musics: Music[]) => unknown): Promise<void> {
    this.logger.debug('getMusicList()');
    this.logger.time(MUSIC_LIST);
    const subject = new Subject<Music[]>();
    const unsubscribe = subject.subscribe(onUpdate);

    if (this.store.has(MUSIC_LIST)) {
      let musicsList = this.store.get<MusicList>(MUSIC_LIST);
      const { folderPath } = musicsList;

      if (!pathExistsSync(folderPath)) {
        throw new Error(`Music folder does not exists: ${folderPath}`);
      }

      let { musicPaths, musics } = musicsList;

      if (musicPaths === undefined) {
        await this.promiseQueue.enqueue(async () => {
          this.logger.info(`Lists musics from ${folderPath}`);
          this.logger.time('listsMusics');

          musicPaths = await listMusics(folderPath);
          musicsList = {
            ...musicsList,
            musicPaths,
          };

          this.store.set(MUSIC_LIST, musicsList);
          this.logger.timeEnd('listsMusics');
        });
      }

      if (musicPaths === undefined) {
        throw new Error('musicPaths is undefined');
      }

      if (musics === undefined) {
        musics = [];
      } else if (musics.length > 0) {
        subject.next(musics);
      }

      const musicCount = musicPaths.length;

      if (musics.length < musicCount) {
        this.logger.info('Processes musics');

        const startTime = Date.now();
        let i = musics.length;

        this.logger.time('processesMusics');

        await Promise.all(
          musicPaths
            .filter((path) => !musics?.some((music) => music.path === path))
            .map(async (path) =>
              this.promiseQueue.enqueue(async () => {
                if (musics === undefined) {
                  throw new Error('musics is undefined');
                }

                const music = await getMusicInfo(path);
                await this.generateCover(music);
                delete music.picture;

                let remainingTime = '';

                if (i > 0) {
                  const now = Date.now();
                  const endTime =
                    now + ((musicCount - i) * (now - startTime)) / i;
                  remainingTime = ` (${dayjs().to(endTime, true)} remaining)`;
                }

                this.logger.debug(
                  `Processed music ${++i}/${musicCount}${remainingTime}`
                );

                musics.push(music);
                this.store.set(MUSIC_LIST, { ...musicsList, musics });
                subject.next(musics);
              })
            )
        );
        this.logger.timeEnd('processesMusics');
        this.logger.info('Music list updated');
      }
    }
    unsubscribe();
    this.logger.timeEnd(MUSIC_LIST);
  }

  async setMusicFolder(folderPath: string): Promise<void> {
    this.logger.debug(`setMusicFolder(): ${folderPath}`);
    await this.promiseQueue.clear();
    this.store.set<MusicList>(MUSIC_LIST, { folderPath });
  }

  private constructor(
    private readonly appPathData: string,
    private readonly logger: Logger,
    private readonly previewApi: LastfmAPI,
    private readonly store: Store,
    private readonly promiseQueue: PromiseQueue
  ) {
    logger.debug('constructor()');

    protocol.registerFileProtocol('cover', (request, callback) => {
      const coverFileName = request.url.substr(8);
      callback(join(this.coversPath, coverFileName));
    });

    protocol.registerFileProtocol('music', (request, callback) => {
      const { musics } = this.store.get<MusicList>(MUSIC_LIST);

      if (musics === undefined) {
        callback({ statusCode: 404 });
        return;
      }

      const pathHash = request.url.substr(8).split('/')[0];
      const musicPath = musics.find((music) => music.pathHash === pathHash);

      if (musicPath === undefined) {
        callback({ statusCode: 404 });
      } else {
        callback(musicPath);
      }
    });
  }

  private async generateCover(music: Music): Promise<void> {
    const { picture } = music;

    try {
      if (picture !== undefined && picture[0] !== undefined) {
        const hash = createHash('md5').update(picture[0].data).digest('hex');
        const coverFileName = `${hash}.jpg`;
        const coverPath = join(this.coversPath, coverFileName);

        if (!pathExistsSync(coverPath)) {
          // eslint-disable-next-line no-async-promise-executor
          await new Promise<void>(async (resolve) => {
            (await jimp.read(picture[0].data))
              .resize(220, 220)
              .quality(85)
              .write(coverPath, resolve as any);
          });
        }
        music.coverURL = `cover://${coverFileName}`;
      } else {
        const coverURL = await this.previewApi.getPreview(music);

        if (validate.string(coverURL)) {
          music.coverURL = coverURL;
        }
      }
    } catch (error) {
      this.logger.error(`Unable to generate preview: ${error.stack}`);
    }
  }
}
