const initAurora = import('./3rdparties/aurora').then((AV) => {
  global.AV = AV;
  import('./3rdparties/alac');
});

let asset;
let streamSource;

async function createStreamSource() {
  await initAurora;

  const { EventEmitter } = global.AV;

  class StreamSource extends EventEmitter {
    constructor() {
      super();

      this.active = false;
      this.events = [];
    }

    emit(event, data) {
      if (this.active) {
        super.emit(event, data);
      } else {
        this.events.push({ event, data });
      }
    }

    start() {
      this.active = true;

      while (this.events.length > 0) {
        const { event, data } = this.events.shift();
        this.emit(event, data);
      }
    }

    pause() {
      this.active = false;
    }

    reset() {
      this.pause();
    }
  }

  streamSource = new StreamSource();
}

async function startDecoder() {
  await initAurora;

  const { Asset } = global.AV;

  asset = new Asset(streamSource);

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

    for (let c = 0; c < channelsPerFrame; c++) {
      for (
        let i = 0, j = c;
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

onmessage = async (event) => {
  if (event.data === 'start') {
    if (asset !== undefined) {
      asset.stop();
    }
    if (streamSource === undefined) {
      await createStreamSource();
    } else {
      streamSource.reset();
    }
    await startDecoder();
  } else if (event.data === 'done') {
    streamSource.emit('done');
  } else {
    const { Buffer: AVBuffer } = global.AV;
    const sharedBufferView = new Uint8Array(event.data);
    const bufferView = new Uint8Array(
      new ArrayBuffer(sharedBufferView.byteLength)
    );

    bufferView.set(sharedBufferView);
    streamSource.emit('data', new AVBuffer(bufferView.buffer));
  }
};
