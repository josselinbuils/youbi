import cn from 'classnames';
import React, { forwardRef } from 'react';
import styles from './ProgressBar.module.scss';

export const ProgressBar = forwardRef<HTMLDivElement, Props>(
  ({ className, disabled = false, onSeekStart, progress, seeking }, ref) => (
    <div
      className={cn(styles.progressBar, className, {
        [styles.disabled]: disabled,
        [styles.seeking]: seeking,
      })}
      onMouseDown={onSeekStart}
      ref={ref}
      role="progressbar"
      tabIndex={0}
    >
      <div className={styles.barContainer}>
        <div className={styles.bar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
);

interface Props {
  className?: string;
  disabled?: boolean;
  progress: number;
  seeking: boolean;
  onSeekStart(downEvent: React.MouseEvent): void;
}
