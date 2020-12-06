import cn from 'classnames';
import React, { forwardRef } from 'react';
import styles from './ProgressBar.module.scss';

export const ProgressBar = forwardRef<HTMLDivElement, Props>(
  ({ className, onSeekStart, progress }, ref) => (
    <div
      className={cn(styles.progressBar, className)}
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
  progress: number;
  onSeekStart(downEvent: React.MouseEvent): void;
}
