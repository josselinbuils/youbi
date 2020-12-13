export function isMusicSupported(path: string): boolean {
  return /\.(aac|aif|flac|m4a|mp3|ogg|wav)$/i.test(path);
}
