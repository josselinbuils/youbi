declare module 'color-thief-browser';
declare module 'ipc-promise';

declare module '*.module.scss' {
  const styles: Record<string, string>;
  export default styles;
}

declare var __webpack_public_path__: string;
