import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import { useRootStore } from '@client/mobxStore/root';

const ButtonSetRandomSubscribe: FC = () => {
  const {
    uiState: { appBusy },
  } = useRootStore();

  const {
    redditNewsUI: { setRandomSubscription },
  } = useRedditNewsStore();
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
