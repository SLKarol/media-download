import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';

const ButtonSetRandomSubscribe: FC = () => {
  const {
    uiState: { appBusy },
  } = useRootStore();

  const {
    mediaNewsUI: { setRandomSubscription },
  } = useMediaNewsStore();
  return (
    <Button
      icon="random"
      title="Случайный выбор"
      onClick={setRandomSubscription}
      disabled={appBusy}
    />
  );
};

export default observer(ButtonSetRandomSubscribe);
