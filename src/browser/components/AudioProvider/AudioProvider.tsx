import React, { createContext, FC, useEffect, useMemo, useState } from 'react';
import { AudioController, AudioState } from './AudioController';

export const AudioContext = createContext<{
  audioController: AudioController | undefined;
  audioState: AudioState | undefined;
}>({
  audioController: undefined,
  audioState: undefined,
});

export const AudioProvider: FC = ({ children }) => {
  const audioController = useMemo(() => new AudioController(), []);
  const [audioState, setAudioState] = useState(() =>
    audioController.getState()
  );

  useEffect(() => {
    const unsubscribe = audioController.audioStateSubject.subscribe(
      setAudioState
    );
    return () => {
      unsubscribe();
      audioController.clear();
    };
  }, [audioController]);

  return (
    <AudioContext.Provider value={{ audioController, audioState }}>
      {children}
    </AudioContext.Provider>
  );
};
