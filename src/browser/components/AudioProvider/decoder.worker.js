import AV from './3rdparties/aurora';

global.AV = AV;

const initALACCodec = import('@josselinbuils/alac');
let asset;
let fetchSource;

class FetchSource extends AV.EventEmitter {
  constructor(url) {
    super();

    this.active = false;
    this.actionManager = [];
    this.url = url;
  }

  emit(event, data) {
    if (this.active) {
      super.emit(event, data);
    } else {
      this.events.push({ event, data });
    }
  }

  pause() {
    this.active = false;
  }

  // eslint-disable-next-line class-methods-use-this
  reset() {}

  async start() {
    this.active = true;

    while (this.events.length > 0) {
      const { event, data } = this.events.shift();
      this.emit(event, data);
    }

    if (this.reader === undefined) {
      try {
        const response = await fetch(this.url);
        this.reader = response.body?.getReader();
      } catch (error) {
        console.error(error);
        this.emit('error', new Error(`Failed to fetch music`));
        return;
      }
    }

    if (this.reader === undefined) {
      this.emit('error', new Error('Unable to get body reader'));
      return;
    }

    while (this.active) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await this.reader.read();

      if (value !== undefined) {
        this.emit('data', new AV.Buffer(value.buffer));
      }

      if (done) {
        this.emit('done');
        break;
      }
    }
  }

  stop() {
    this.pause();
    this.reader?.cancel();
  }
}

async function startDecoder(url) {
  await initALACCodec;

  fetchSource = new FetchSource(url);
  asset = new AV.Asset(fetchSource);

  let format;

  asset.on('duration', (duration) => {
    postMessage({ duration });
  });

  asset.on('format', (f) => {
    format = f;
    postMessage({ format });
  });

  asset.on('data', (buffer) => {
    const { length } = buffer;
    const { channelsPerFrame } = format;
    const channelBufferLength = length / channelsPerFrame;
    const outputBuffer = new SharedArrayBuffer(buffer.byteLength);
    const outputBufferView = new Float32Array(outputBuffer);

    for (let c = 0 | 0; c < channelsPerFrame; c++) {
      for (
        let i = 0 | 0, j = c | 0;
        i < channelBufferLength;
        i++, j += channelsPerFrame
      ) {
        outputBufferView[c * channelBufferLength + i] = buffer[j];
      }
    }

    postMessage(outputBuffer);
  });

  asset.on('error', (error) => postMessage(error));

  asset.start();
}

function stopDecoder() {
  if (asset !== undefined) {
    asset.stop();
  }
  if (fetchSource !== undefined) {
    fetchSource.stop();
  }
}

global.onerror = (error) => postMessage(error);

global.onmessage = async (event) => {
  if (event.data === 'stop') {
    stopDecoder();
    postMessage('stopped');
  } else {
    await startDecoder(event.data);
  }
};
