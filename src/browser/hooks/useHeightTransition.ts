import { CSSProperties, useLayoutEffect, useState } from 'react';
import { cancelable } from '../utils/cancelable';
import { delay } from '../utils/delay';

interface TransitionOptions {
  closeDelayMs?: number;
  closeDurationMs?: number;
  closeTimingFunction?: string;
  openDelayMs?: number;
  openDurationMs?: number;
  openTimingFunction?: string;
}

export type TransitionState =
  | 'closed'
  | 'createDom'
  | 'opening'
  | 'opened'
  | 'closing';

export function useHeightTransition(
  shouldOpen: boolean,
  height: number,
  {
    closeDelayMs = 0,
    closeDurationMs = 150,
    closeTimingFunction = 'linear',
    openDelayMs = 0,
    openDurationMs = 150,
    openTimingFunction = 'linear',
  }: TransitionOptions = {}
): { style: CSSProperties; transitionState: TransitionState } {
  const [transitionState, setTransitionState] = useState<TransitionState>(
    'closed'
  );

  useLayoutEffect(() => {
    setTransitionState(shouldOpen ? 'createDom' : 'closing');
  }, [shouldOpen]);

  useLayoutEffect(() => {
    switch (transitionState) {
      case 'createDom':
        if (height > 0) {
          setTransitionState('opening');
        }
        break;

      case 'opening': {
        const [promise, cancel] = cancelable(
          delay(openDelayMs + openDurationMs)
        );
        promise.then(() => setTransitionState('opened'));
        return cancel;
      }

      case 'closing': {
        const [promise, cancel] = cancelable(
          delay(closeDelayMs + closeDurationMs)
        );
        promise.then(() => setTransitionState('closed'));
        return cancel;
      }

      default:
      // Ignored
    }
  }, [
    closeDelayMs,
    closeDurationMs,
    height,
    openDelayMs,
    openDurationMs,
    transitionState,
  ]);

  const style = {} as CSSProperties;

  switch (transitionState) {
    case 'closed':
    case 'createDom':
      style.height = 0;
      style.transition = `height ${openDurationMs}ms ${openTimingFunction} ${openDelayMs}ms`;
      break;

    case 'opening':
      style.height = height;
      style.transition = `height ${openDurationMs}ms ${openTimingFunction} ${openDelayMs}ms`;
      break;

    case 'opened':
      style.height = height;
      style.transition = `height ${closeDurationMs}ms ${closeTimingFunction} ${closeDelayMs}ms`;
      break;

    case 'closing':
      style.height = 0;
      style.transition = `height ${closeDurationMs}ms ${closeTimingFunction} ${closeDelayMs}ms`;
      break;

    default:
    // Ignored
  }

  return { style, transitionState };
}
