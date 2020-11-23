import { useContext } from 'react';
import { AudioContext } from './AudioProvider';

export function useAudio() {
  const { audioController, audioState } = useContext(AudioContext);

  if (audioController === undefined || audioState === undefined) {
    throw new Error('Unable to retrieve audioController and/or audioState');
  }
  return { audioController, audioState };
}
