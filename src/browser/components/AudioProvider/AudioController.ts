import { Subject } from '@josselinbuils/utils/Subject';
import dayjs from 'dayjs';
// eslint-disable-next-line import/no-unresolved,import/no-webpack-loader-syntax
import DecodingWorker from 'worker-loader!./decoder.worker';
import { Music } from '../../../shared/Music';

const worker = new DecodingWorker();

export class AudioController {
  audioStateSubject: Subject<AudioState>;

  private activeMusic?: Music;
  private readonly audioContext = new AudioContext();
  private readonly audioElement = new Audio();
  private currentTime = '00:00';
  private get paused(): boolean {
    return this.audioElement.paused;
  }
  private playlist: Music[] = [];
  private progress = 0;
  private random = false;
  private repeat = false;

  constructor() {
    this.audioElement.addEventListener('ended', this.musicEndListener);
    this.audioElement.addEventListener('timeupdate', this.timeUpdateListener);
    this.audioStateSubject = new Subject(this.getState());
  }

  clear(): void {
    this.audioElement.removeEventListener('ended', this.musicEndListener);
    this.audioElement.removeEventListener(
      'timeupdate',
      this.timeUpdateListener
    );
    this.audioElement.pause();
  }

  getState(): AudioState {
    return {
      activeMusic: this.activeMusic,
      currentTime: this.currentTime,
      paused: this.paused,
      playlist: this.playlist,
      progress: this.progress,
      random: this.random,
      repeat: this.repeat,
    };
  }

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

    const { paused } = this;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  };

  play = async (): Promise<void> => {
    if (this.activeMusic === undefined) {
      return;
    }

    let promise = Promise.resolve();

    if (this.paused) {
      promise = this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
    this.publishState();
    await promise;
  };

  playMusic = async (music: Music): Promise<void> => {
    if (
      this.activeMusic === undefined ||
      music.path !== this.activeMusic.path
    ) {
      await this.loadMusic(music);
    }
    await this.play();
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

    const { paused } = this;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  };

  /**
   * @param value 0 -> 1
   */
  setCurrentTime = (value: number): void => {
    const { duration } = this.audioElement;

    this.audioElement.currentTime = Math.min(
      Math.round(value * duration),
      duration - 1
    );
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

  private async decode(music: Music): Promise<void> {
    let duration: number;
    let format: any;
    let audioBuffer: AudioBuffer;
    let offset = 0;
    let started = false;

    worker.onerror = (message: ErrorEvent) => console.error(message);

    worker.onmessage = ({ data }: MessageEvent) => {
      if (data?.duration) {
        ({ duration } = data);
      } else if (data?.format) {
        ({ format } = data);
      } else if (data instanceof SharedArrayBuffer) {
        const { channelsPerFrame, sampleRate } = format;
        const buffer = new Float32Array(data);
        const channelBufferLength = buffer.length / channelsPerFrame;

        if (audioBuffer === undefined) {
          if (duration === undefined) {
            throw new Error('Unable to retrieve duration');
          }

          audioBuffer = new AudioBuffer({
            length: Math.ceil((duration / 1000) * sampleRate),
            numberOfChannels: channelsPerFrame,
            sampleRate,
          });
        }

        for (let c = 0; c < channelsPerFrame; c++) {
          audioBuffer.copyToChannel(
            buffer.slice(
              c * channelBufferLength,
              (c + 1) * channelBufferLength
            ),
            c,
            offset
          );
        }

        offset += channelBufferLength;

        if (!started) {
          started = true;
          const source = this.audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(this.audioContext.destination);
          // start the source playing
          source.start();
        }
      } else {
        console.log(data);
      }
    };

    const response = await fetch(`music://${music.pathHash}`);
    const reader = response.body?.getReader();

    if (reader !== undefined) {
      worker.postMessage('start');

      (async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { value, done } = await reader.read();

          if (value !== undefined) {
            const sharedBuffer = new SharedArrayBuffer(value.byteLength);
            const sharedBufferView = new Uint8Array(sharedBuffer);
            sharedBufferView.set(value);
            worker.postMessage(sharedBuffer);
          }

          if (done) {
            worker.postMessage('done');
            break;
          }
        }
      })();
    }
  }

  private async loadMusic(music: Music): Promise<void> {
    if (!this.playlist.includes(music)) {
      throw new Error('playlist does not contain the given music');
    }
    try {
      await this.decode(music);
      this.activeMusic = music;
      this.progress = 0;
      this.publishState();
    } catch (error) {
      console.log(error);
    }
  }

  private readonly musicEndListener = async () => {
    if (!this.repeat) {
      await this.next();
    }
    await this.play();
  };

  private publishState(): void {
    this.audioStateSubject.next(this.getState());
  }

  private readonly rand = async (): Promise<void> => {
    const newIndex = Math.round(this.playlist.length * Math.random());
    const { paused } = this.audioElement;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  };

  private readonly timeUpdateListener = () => {
    this.currentTime = dayjs(
      Math.round(this.audioElement.currentTime) * 1000
    ).format('mm:ss');
    this.progress =
      Math.round(
        (this.audioElement.currentTime / this.audioElement.duration) * 10000
      ) / 100;
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
