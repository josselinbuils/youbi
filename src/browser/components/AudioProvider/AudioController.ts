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
  private readonly audioElement = new Audio();
  private audioSource?: AudioBufferSourceNode;
  private currentTime = 0;
  private currentWorkerIndex = 0;
  private readonly decodingWorkerPool = [
    new DecodingWorker(),
    new DecodingWorker(),
  ];
  private readonly gainNode = this.audioContext.createGain();
  private readonly interval: number;
  private get paused(): boolean {
    return this.audioSource === undefined;
  }
  private playlist: Music[] = [];
  private random = false;
  private repeat = false;
  private startTime = 0;

  constructor() {
    this.interval = window.setInterval(this.timeUpdateListener, 500);
    this.audioStateSubject = new Subject(this.getState());
    this.getOutputs().then((outputs) => this.setOutput(outputs[0]));
  }

  clear = (): void => {
    window.clearInterval(this.interval);

    while (this.decodingWorkerPool.length > 0) {
      this.decodingWorkerPool.shift()?.terminate();
    }
  };

  getOutputs = async (): Promise<MediaDeviceInfo[]> =>
    (await navigator.mediaDevices.enumerateDevices())
      .filter(({ kind }) => kind === 'audiooutput')
      .filter(
        ({ groupId }, index, list) =>
          list.findIndex((device) => device.groupId === groupId) === index
      );

  getState = (): AudioState => {
    return {
      activeMusic: this.activeMusic,
      outputDeviceId: (this.audioElement as any).sinkId,
      currentTime: dayjs(this.currentTime * 1000).format('mm:ss'),
      paused: this.paused,
      playlist: this.playlist,
      progress:
        Math.round(
          (this.currentTime / (this.activeMusic?.duration ?? 1)) * 10000
        ) / 100,
      random: this.random,
      repeat: this.repeat,
      volume: this.gainNode.gain.value,
    };
  };

  next = async (shouldReturnToFirstMusic = true): Promise<void> => {
    if (this.activeMusic === undefined) {
      return;
    }

    if (this.random) {
      return this.rand();
    }

    let newIndex = this.playlist.indexOf(this.activeMusic) + 1;

    if (newIndex >= this.playlist.length) {
      newIndex = 0;

      if (!shouldReturnToFirstMusic) {
        this.pause();
      }
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
    this.publishState();
  };

  play = async (): Promise<void> => {
    if (this.activeMusic === undefined) {
      return;
    }

    if (this.paused) {
      await this.initSource();
    } else {
      this.pause();
    }
    this.publishState();
  };

  playMusic = async (music: Music): Promise<void> => {
    try {
      if (!this.paused) {
        this.pause();
      }
      await this.loadMusic(music);
      await this.initSource();
      this.publishState();
    } catch (error) {
      this.publishState();
      throw error;
    }
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
  setCurrentTime = async (value: number): Promise<void> => {
    if (this.activeMusic === undefined || this.audioBuffer === undefined) {
      return;
    }
    const { duration } = this.activeMusic;

    this.audioSource?.stop();
    this.currentTime = Math.floor(
      Math.max(Math.min(Math.round(value * duration), duration - 1), 0)
    );
    await this.initSource();
  };

  setOutput = async (output: MediaDeviceInfo): Promise<void> => {
    await (this.audioElement as any).setSinkId(output.deviceId);
    this.publishState();
  };

  setVolume = (volume: number): void => {
    this.gainNode.gain.value = Math.min(Math.max(volume, 0), 1);
    this.publishState();
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
    return new Promise((resolve, reject) => {
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
              reject(new Error('Unable to retrieve duration'));
              return;
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
          reject(new Error(data));
        }
      };

      decodingWorker.postMessage(`music://${music.pathHash}`);
    });
  };

  private initSource = async (): Promise<void> => {
    if (this.audioBuffer === undefined) {
      throw new Error('No audio buffer');
    }
    this.audioSource?.removeEventListener('ended', this.musicEndListener);

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.addEventListener('ended', this.musicEndListener);
    source.start(0, this.currentTime);

    const streamNode = this.audioContext.createMediaStreamDestination();
    source.connect(this.gainNode).connect(streamNode);

    this.audioElement.srcObject = streamNode.stream;
    await this.audioElement.play();

    this.audioSource = source;
    this.startTime = performance.now() - this.currentTime * 1000;
  };

  private loadMusic = async (music: Music): Promise<void> => {
    if (!this.playlist.includes(music)) {
      throw new Error('playlist does not contain the given music');
    }
    this.activeMusic = music;
    this.currentTime = 0;
    this.publishState();
    await this.decode(music);
  };

  private musicEndListener = async () => {
    if (!this.repeat) {
      await this.next(false);
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
    this.publishState();
  };
}

export interface AudioState {
  activeMusic?: Music;
  currentTime: string;
  outputDeviceId: string;
  paused: boolean;
  playlist: Music[];
  progress: number;
  random: boolean;
  repeat: boolean;
  volume: number;
}
