/* eslint-disable no-await-in-loop */
import { createHash } from 'crypto';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { protocol } from 'electron';
import { lstatSync, pathExistsSync, readdir } from 'fs-extra';
import jimp from 'jimp';
import musicMetadata from 'music-metadata';
import { join } from 'path';
import { Music } from '../shared/Music';
import { COVERS_FOLDER } from './constants';
import { LastfmAPI } from './LastfmAPI';
import { Logger } from './Logger';
import { Store } from './Store';
import { validate } from './validate';

dayjs.extend(relativeTime);

export class Browser {
  private coversPath = join(this.appPathData, COVERS_FOLDER);

  static create(appDataPath: string): Browser {
    return new Browser(
      appDataPath,
      Logger.create('Browser'),
      LastfmAPI.create(),
      Store.getInstance()
    );
  }

  private static async getMusicInfo(path: string): Promise<any> {
    const { common, format } = await musicMetadata.parseFile(path);
    const {
      album,
      albumartist,
      artist,
      artists,
      comment,
      composer,
      disk,
      genre,
      picture,
      title,
      track,
      year,
    } = common;
    const { duration, sampleRate } = format;
    const readableDuration = dayjs((duration || 0) * 1000).format('mm:ss');
    const pathHash = createHash('md5').update(path).digest('hex');

    return {
      album,
      albumArtist: albumartist,
      artist,
      artists,
      comment,
      composer,
      disk,
      duration,
      genre,
      path,
      pathHash,
      picture,
      readableDuration,
      sampleRate,
      title,
      track,
      year,
    };
  }

  private static isSupported(path: string): boolean {
    return /\.(aac|aif|flac|m4a|mp3|ogg|wav)$/i.test(path);
  }

  async getMusicList(folderPath: string): Promise<Music[]> {
    this.logger.debug('getMusicList()');
    this.logger.time('musicList');
    let musics: Music[];

    if (this.store.has('musicList')) {
      this.logger.debug('From cache');
      const musicList = this.store.get('musicList');
      ({ musics } = musicList);
    } else {
      this.logger.debug('From file system');

      if (!pathExistsSync(folderPath)) {
        throw new Error('Music folder does not exists');
      }

      this.logger.info(`Lists musics from ${folderPath}`);
      this.logger.time('listsMusics');
      let musicPaths: string[];
      if (this.store.has('musicPaths')) {
        musicPaths = this.store.get('musicPaths');
      } else {
        musicPaths = await this.listMusics(folderPath);
        this.store.set('musicPaths', musicPaths);
      }
      this.logger.timeEnd('listsMusics');

      const startTime = Date.now();
      let i = 0;
      musics = [];

      this.logger.time('processesMusics');
      for (const path of musicPaths) {
        let remainingTime = '';

        if (i > 0) {
          const now = Date.now();
          const endTime =
            now + ((musicPaths.length - i) * (now - startTime)) / i;
          remainingTime = ` (${dayjs().to(endTime, true)} remaining)`;
        }

        this.logger.debug(
          `Processes music ${++i}/${musicPaths.length}${remainingTime}`
        );

        const music = await Browser.getMusicInfo(path);
        await this.generateCover(music);
        delete music.picture;
        musics.push(music);
      }
      this.logger.timeEnd('processesMusics');

      const md5 = createHash('md5').update(musicPaths.join('')).digest('hex');
      this.store.set('musicList', { md5, musics });
      this.logger.info('Music list updated');
    }
    this.logger.timeEnd('musicList');

    return musics;
  }

  private constructor(
    private readonly appPathData: string,
    private readonly logger: Logger,
    private readonly previewApi: LastfmAPI,
    private readonly store: Store
  ) {
    logger.debug('constructor()');

    protocol.registerFileProtocol('cover', (request, callback) => {
      const coverFileName = request.url.substr(8);
      callback(join(this.coversPath, coverFileName));
    });

    protocol.registerFileProtocol('music', (request, callback) => {
      const musics = this.store.get('musicList').musics as Music[];
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

  private async listMusics(path: string): Promise<string[]> {
    this.logger.debug('listMusics():', path);

    if (lstatSync(path).isDirectory()) {
      const res = [] as string[];

      const filePromises = (await readdir(path)).map(async (dir) =>
        this.listMusics(join(path, dir))
      );

      (await Promise.all(filePromises)).forEach((a) => res.push(...a));

      return res.filter(Browser.isSupported);
    }
    return [path];
  }
}
