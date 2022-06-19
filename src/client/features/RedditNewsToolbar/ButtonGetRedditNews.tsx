import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';

const { ipcRenderer } = window.electron;

const ButtonGetRedditNews: FC = () => {
  const {
    mediaNewsUI: { selectedSubscribeId },
    mediaNewsContentStore: { clearContent },
  } = useMediaNewsStore();
  const {
    uiState: { appBusy, setAppBusy },
  } = useRootStore();

  const onClick = () => {
    clearContent();
    ipcRenderer.getRedditNews({ after: null, channel: selectedSubscribeId });
    setAppBusy(true);
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
