import { Subject } from '@josselinbuils/utils/Subject';
import dayjs from 'dayjs';
// eslint-disable-next-line import/no-unresolved,import/no-webpack-loader-syntax
import DecodingWorker from 'worker-loader!./decoder.worker';
import { Music } from '../../../shared/Music';

export class AudioController {
  audioStateSubject: Subject<AudioState>;

  private activeMusic?: Music;
  private readonly audioContext = new AudioContext();
  private readonly audioElement = new Audio();
  private currentTime = '00:00';
  private currentWorkerIndex = 0;
  private readonly decodingWorkerPool = [
    new DecodingWorker(),
    new DecodingWorker(),
  ];
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

    while (this.decodingWorkerPool.length > 0) {
      this.decodingWorkerPool.shift()?.terminate();
    }
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

    await this.loadMusic(this.playlist[newIndex]);

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

    await this.loadMusic(this.playlist[newIndex]);

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

  private async decode(music: Music): Promise<MediaStream> {
    return new Promise((resolve) => {
      const { currentWorkerIndex, decodingWorkerPool } = this;
      let duration: number;
      let format: any;
      let audioBuffer: AudioBuffer;
      let offset = 0;

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

          if (audioBuffer === undefined) {
            if (duration === undefined) {
              throw new Error('Unable to retrieve duration');
            }

            audioBuffer = new AudioBuffer({
              length: Math.ceil((duration / 1000) * sampleRate),
              numberOfChannels: channelsPerFrame,
              sampleRate,
            });

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.start();

            const streamNode = this.audioContext.createMediaStreamDestination();
            source.connect(streamNode);

            resolve(streamNode.stream);
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
        } else {
          console.log(data);
        }
      };

      decodingWorker.postMessage(`music://${music.pathHash}`);
    });
  }

  private async loadMusic(music: Music): Promise<void> {
    if (!this.playlist.includes(music)) {
      throw new Error('playlist does not contain the given music');
    }
    if (!this.paused) {
      this.audioElement.pause();
    }
    this.activeMusic = music;
    // this.audioElement.src = `music://${music.pathHash}`;
    // this.audioElement.load();
    this.audioElement.srcObject = await this.decode(music);
    this.progress = 0;
    this.publishState();
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

    await this.loadMusic(this.playlist[newIndex]);

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
