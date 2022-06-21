import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';

const { ipcRenderer } = window.electron;

const ButttonGetYapNews: FC = () => {
  const {
    uiState: { appBusy, setAppBusy },
  } = useRootStore();

  const {
    mediaNewsUI: { selectedForum },
    listForums: { clear },
  } = useMediaNewsStore();

  const onClick = () => {
    clear();
    setAppBusy(true);
    ipcRenderer.getYaplakalNews(selectedForum.url);
  };

  return (
    <Button
      icon="cloud-download"
      title="Запросить новые записи"
      onClick={onClick}
      disabled={!selectedForum || appBusy}
    />
  );
};

export default observer(ButttonGetYapNews);
