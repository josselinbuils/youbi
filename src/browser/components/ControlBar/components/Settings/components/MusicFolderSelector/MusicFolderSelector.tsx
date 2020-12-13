import React, { FC } from 'react';
import { SELECT_MUSIC_FOLDER_ACTION } from '../../../../../../../shared/actions';
import { SharedProperties } from '../../../../../../../shared/SharedProperties';
import { Button } from '../../../Button/Button';
import styles from './MusicFolderSelector.module.scss';

export const MusicFolderSelector: FC = () => (
  <Button
    aria-label="music folder selector"
    className={styles.button}
    onClick={selectMusicFolder}
  >
    <i aria-hidden="true" className="fas fa-folder-open" />
  </Button>
);

function selectMusicFolder(): void {
  const { actions } = window.remote as SharedProperties;
  actions.send({ type: SELECT_MUSIC_FOLDER_ACTION });
}
