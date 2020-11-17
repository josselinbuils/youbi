import request from 'request-promise-native';
import { LASTFM_API_KEY } from '../config.json';
import { Music } from '../shared/interfaces/Music';
import { validate } from '../shared/utils';
import { Logger } from './Logger';
import { PromiseQueue } from './PromiseQueue';

export class LastfmAPI {
  private cache = {} as { [key: string]: Promise<string> };
  private readonly uri = 'http://ws.audioscrobbler.com/2.0';

  static create(): LastfmAPI {
    return new LastfmAPI(Logger.create('LastfmApi'), PromiseQueue.create(5));
  }

  async getPreview(music: Music): Promise<string | undefined> {
    this.logger.debug('getPreview()');

    const artist =
      music.albumArtist !== undefined ? music.albumArtist : music.artist;
    const search = encodeURIComponent(
      `${artist} ${music.album}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    );

    if (this.cache[search] !== undefined) {
      return this.cache[search];
    }

    const options = this.getBaseRequest();

    options.qs.method = 'album.search';
    options.qs.album = search;

    try {
      const promise = this.queue
        .enqueue(() => request(options))
        .then((response) => {
          const matches = response.results.albummatches.album;

          if (validate.array(matches)) {
            const res = matches.filter((r: any) =>
              validate.string(r.image[0]['#text'])
            )[0];
            return res !== undefined
              ? res.image[res.image.length - 1]['#text']
              : undefined;
          }
          return '';
        });

      this.cache[options.qs.album] = promise;
      return promise;
    } catch (error) {
      this.logger.error(error);
    }
  }

  private constructor(private logger: Logger, private queue: PromiseQueue) {
    this.logger.debug('constructor()');
  }

  private getBaseRequest(): any {
    return {
      uri: this.uri,
      qs: {
        api_key: LASTFM_API_KEY,
        format: 'json',
      },
      json: true,
      timeout: 5000,
    };
  }
}
