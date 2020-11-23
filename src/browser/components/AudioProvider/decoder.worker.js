// eslint-disable-next-line no-restricted-globals
const context = self;

const initAurora = import('./3rdparties/aurora').then((AV) => {
  global.AV = AV;
  import('./3rdparties/alac');
});

async function decode(fileBuffer) {
  await initAurora;
  const fileBufferView = new Uint8Array(fileBuffer);
  const bufferView = new Uint8Array(new ArrayBuffer(fileBuffer.byteLength));
  bufferView.set(fileBufferView);
  const asset = global.AV.Asset.fromBuffer(bufferView.buffer);

  let format;

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

    context.postMessage(outputBuffer);
  });

  asset.start();
}

onmessage = async (event) => {
  await decode(event.data);
};
