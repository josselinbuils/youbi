import cn from 'classnames';
import React, { FC } from 'react';
import styles from './Letter.module.scss';

export const Letter: FC<Props> = ({ letter }) => (
  <div className={cn(styles.letter, { [styles.show]: !!letter })}>{letter}</div>
);

interface Props {
  letter: string | undefined;
}
