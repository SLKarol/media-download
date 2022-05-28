import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import { useRootStore } from '@client/mobxStore/root';

const { ipcRenderer } = window.electron;

const ButtonGetRedditNews: FC = () => {
  const {
    redditNewsUI: { selectedSubscribeId },
    redditNewsContentStore: { clearContent },
  } = useRedditNewsStore();
  const {
    uiState: { appBusy },
  } = useRootStore();

  const onClick = () => {
    clearContent();
    ipcRenderer.getRedditNews(selectedSubscribeId);
  };
  return (
    <Button
      icon="cloud-download"
      title="Запросить новые записи"
      onClick={onClick}
      disabled={!selectedSubscribeId || appBusy}
    />
  );
};

export default observer(ButtonGetRedditNews);
