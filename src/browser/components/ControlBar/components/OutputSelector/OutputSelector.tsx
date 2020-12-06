import cn from 'classnames';
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAudio } from '../../../AudioProvider/useAudio';
import { Button } from '../Button/Button';
import styles from './OutputSelector.module.scss';
import { useHeightTransition } from '../../../../hooks/useHeightTransition';
import { cancelable } from '../../../../utils/cancelable';

export const OutputSelector: FC = () => {
  const [height, setHeight] = useState(0);
  const [opened, setOpened] = useState(false);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const innerElementRef = useRef<HTMLDivElement>(null);
  const { style, transitionState } = useHeightTransition(opened, height);
  const { audioController, audioState } = useAudio();

  useEffect(() => {
    if (opened) {
      const [promise, cancel] = cancelable(audioController.getOutputs());
      promise.then(setOutputs);
      return cancel;
    }
    setOutputs([]);
  }, [audioController, opened]);

  useLayoutEffect(() => {
    if (transitionState === 'createDom' && outputs.length > 0) {
      setHeight(innerElementRef.current?.getBoundingClientRect().height || 0);
    } else if (transitionState === 'closed' && height > 0) {
      setHeight(0);
    }
  }, [height, outputs, transitionState]);

  return (
    <>
      <Button
        aria-label="output selector"
        checked={opened}
        className={styles.outputSelectorButton}
        onClick={() => setOpened(!opened)}
      >
        <i aria-hidden="true" className="fas fa-headphones" />
      </Button>
      {transitionState !== 'closed' &&
        createPortal(
          <>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
            <div className={styles.backdrop} onClick={() => setOpened(false)} />
            <div className={styles.outputSelector} style={style}>
              <div className={styles.inner} ref={innerElementRef}>
                {outputs.map((deviceInfo) => (
                  <button
                    className={cn(styles.output, {
                      [styles.active]:
                        deviceInfo.deviceId === audioState.output?.deviceId,
                    })}
                    key={deviceInfo.deviceId}
                    onClick={async () => {
                      await audioController.setOutput(deviceInfo);
                      setOpened(false);
                    }}
                    type="button"
                  >
                    {deviceInfo.label.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};
