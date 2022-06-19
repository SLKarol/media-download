import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './index.module.css';

const { ipcRenderer } = window.electron;

const RedditMoreNews: FC = () => {
  const {
    uiState: { appBusy, setAppBusy },
  } = useRootStore();
  const {
    mediaNewsContentStore: { haveRecords, after },
    mediaNewsUI: { selectedSubscribeId },
  } = useMediaNewsStore();

  const onClick = () => {
    setAppBusy(true);
    ipcRenderer.getRedditNews({ after, channel: selectedSubscribeId });
  };

  if (!haveRecords) return null;

  return (
    <div className={styles.component}>
      <Button
        icon="cloud-download"
        title="Запросить продолжение ленты"
        onClick={onClick}
        disabled={appBusy}
      />
    </div>
  );
};

export default observer(RedditMoreNews);
