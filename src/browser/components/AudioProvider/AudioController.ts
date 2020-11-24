import { Subject } from '@josselinbuils/utils/Subject';
import dayjs from 'dayjs';
// eslint-disable-next-line import/no-unresolved,import/no-webpack-loader-syntax
import DecodingWorker from 'worker-loader!./decoder.worker';
import { Music } from '../../../shared/Music';

export class AudioController {
  audioStateSubject: Subject<AudioState>;

  private activeMusic?: Music;
  private audioBuffer?: AudioBuffer;
  private readonly audioContext = new AudioContext();
  private audioSource?: AudioBufferSourceNode;
  private currentReadableTime = '00:00';
  private currentTime = 0;
  private currentWorkerIndex = 0;
  private readonly decodingWorkerPool = [
    new DecodingWorker(),
    new DecodingWorker(),
  ];
  private readonly interval: number;
  private get paused(): boolean {
    return this.audioSource === undefined;
  }
  private playlist: Music[] = [];
  private progress = 0;
  private random = false;
  private repeat = false;
  private startTime = 0;

  constructor() {
    this.interval = window.setInterval(this.timeUpdateListener, 500);
    this.audioStateSubject = new Subject(this.getState());
  }

  clear = (): void => {
    window.clearInterval(this.interval);

    while (this.decodingWorkerPool.length > 0) {
      this.decodingWorkerPool.shift()?.terminate();
    }
  };

  getState = (): AudioState => {
    return {
      activeMusic: this.activeMusic,
      currentTime: this.currentReadableTime,
      paused: this.paused,
      playlist: this.playlist,
      progress: this.progress,
      random: this.random,
      repeat: this.repeat,
    };
  };

  next = async (): Promise<void> => {
    if (this.activeMusic === undefined) {
      return;
    }

    if (this.random) {
      return this.rand();
    }

    let newIndex = this.playlist.indexOf(this.activeMusic) + 1;

    if (newIndex >= this.playlist.length) {
      newIndex = 0;
    }

    if (this.paused) {
      await this.loadMusic(this.playlist[newIndex]);
    } else {
      await this.playMusic(this.playlist[newIndex]);
    }
  };

  pause = () => {
    this.audioSource?.removeEventListener('ended', this.musicEndListener);
    this.audioSource?.stop();
    delete this.audioSource;
  };

  play = (): void => {
    if (this.activeMusic === undefined) {
      return;
    }

    if (this.paused) {
      this.initSource();
    } else {
      this.pause();
    }
    this.publishState();
  };

  playMusic = async (music: Music): Promise<void> => {
    await this.loadMusic(music);

    if (!this.paused) {
      this.pause();
    }
    this.initSource();
    this.publishState();
  };

  prev = async (): Promise<void> => {
    if (this.activeMusic === undefined) {
      return;
    }

    if (this.random) {
      return this.rand();
    }

    let newIndex = this.playlist.indexOf(this.activeMusic) - 1;

    if (newIndex < 0) {
      newIndex = this.playlist.length - 1;
    }

    if (this.paused) {
      await this.loadMusic(this.playlist[newIndex]);
    } else {
      await this.playMusic(this.playlist[newIndex]);
    }
  };

  /**
   * @param value 0 -> 1
   */
  setCurrentTime = (value: number): void => {
    if (this.activeMusic === undefined || this.audioBuffer === undefined) {
      return;
    }
    const { duration } = this.activeMusic;

    this.audioSource?.stop();
    this.currentTime = Math.floor(
      Math.max(Math.min(Math.round(value * duration), duration - 1), 0)
    );
    this.initSource();
  };

  setPlaylist = (playlist: Music[]): void => {
    this.playlist = playlist;
    this.publishState();
  };

  toggleRepeat = (): void => {
    this.repeat = !this.repeat;
    this.publishState();
  };

  toggleRandom = (): void => {
    this.random = !this.random;
    this.publishState();
  };

  private decode = async (music: Music): Promise<MediaStream> => {
    return new Promise((resolve) => {
      const { currentWorkerIndex, decodingWorkerPool } = this;
      let duration: number;
      let format: any;
      let offset = 0;

      delete this.audioBuffer;

      const previousWorker = decodingWorkerPool[currentWorkerIndex];
      previousWorker.onerror = null;
      previousWorker.onmessage = null;
      previousWorker.postMessage('stop');

      this.currentWorkerIndex =
        (currentWorkerIndex + 1) % decodingWorkerPool.length;

      const decodingWorker = decodingWorkerPool[this.currentWorkerIndex];

      decodingWorker.onerror = (message: ErrorEvent) => console.error(message);

      decodingWorker.onmessage = ({ data }: MessageEvent) => {
        if (data?.duration) {
          ({ duration } = data);
        } else if (data?.format) {
          ({ format } = data);
        } else if (data instanceof SharedArrayBuffer) {
          const { channelsPerFrame, sampleRate } = format;
          const buffer = new Float32Array(data);
          const channelBufferLength = buffer.length / channelsPerFrame;

          if (this.audioBuffer === undefined) {
            if (duration === undefined) {
              throw new Error('Unable to retrieve duration');
            }

            this.audioBuffer = new AudioBuffer({
              length: Math.ceil((duration / 1000) * sampleRate),
              numberOfChannels: channelsPerFrame,
              sampleRate,
            });

            resolve();
          }

          for (let c = 0; c < channelsPerFrame; c++) {
            this.audioBuffer.copyToChannel(
              buffer.slice(
                c * channelBufferLength,
                (c + 1) * channelBufferLength
              ),
              c,
              offset
            );
          }

          offset += channelBufferLength;
        } else {
          console.log(data);
        }
      };

      decodingWorker.postMessage(`music://${music.pathHash}`);
    });
  };

  private initSource = (): void => {
    if (this.audioBuffer === undefined) {
      throw new Error('No audio buffer');
    }
    this.audioSource?.removeEventListener('ended', this.musicEndListener);

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.addEventListener('ended', this.musicEndListener);
    source.connect(this.audioContext.destination);
    source.start(0, this.currentTime);

    this.audioSource = source;
    this.startTime = performance.now() - this.currentTime * 1000;
  };

  private loadMusic = async (music: Music): Promise<void> => {
    if (!this.playlist.includes(music)) {
      throw new Error('playlist does not contain the given music');
    }
    this.publishState();
    await this.decode(music);
    this.activeMusic = music;
    this.currentTime = 0;
    this.progress = 0;
  };

  private musicEndListener = async () => {
    if (!this.repeat) {
      await this.next();
    } else if (this.activeMusic !== undefined) {
      await this.playMusic(this.activeMusic);
    }
  };

  private publishState = (): void => {
    this.audioStateSubject.next(this.getState());
  };

  private readonly rand = async (): Promise<void> => {
    const newIndex = Math.floor(this.playlist.length * Math.random());

    if (this.paused) {
      await this.loadMusic(this.playlist[newIndex]);
    } else {
      await this.playMusic(this.playlist[newIndex]);
    }
  };

  private readonly timeUpdateListener = () => {
    if (this.activeMusic === undefined || this.paused) {
      return;
    }

    this.currentTime = Math.min(
      (performance.now() - this.startTime) / 1000,
      this.activeMusic.duration
    );
    this.currentReadableTime = dayjs(this.currentTime * 1000).format('mm:ss');
    this.progress =
      Math.round((this.currentTime / this.activeMusic.duration) * 10000) / 100;

    this.publishState();
  };
}

export interface AudioState {
  activeMusic?: Music;
  currentTime: string;
  paused: boolean;
  playlist: Music[];
  progress: number;
  random: boolean;
  repeat: boolean;
}
