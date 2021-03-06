declare module 'color-thief-browser';

declare module '*.module.scss' {
  const styles: Record<string, string>;
  export default styles;
}

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export = WebpackWorker;
}

declare var __webpack_public_path__: string;

interface Window {
  remote: unknown;
}
