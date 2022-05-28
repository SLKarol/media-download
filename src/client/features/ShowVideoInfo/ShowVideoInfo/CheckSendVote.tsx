import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, Classes } from '@blueprintjs/core';
import clsx from 'clsx';

import { useRootStore } from '@client/mobxStore/root';

const CheckSendVote: FC = () => {
  const {
    videoInfo: {
      sendVote,
      setSendVote,
      info: { haveVideo },
      isVideoReddit,
    },
    uiState: { appBusy },
  } = useRootStore();
  return (
    haveVideo &&
    isVideoReddit && (
      <Checkbox
        checked={sendVote}
        label="Во время скачивания проголосовать за видео"
        className={clsx(appBusy && Classes.SKELETON)}
        onChange={setSendVote}
      />
    )
  );
};

export default observer(CheckSendVote);
