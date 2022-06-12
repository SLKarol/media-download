import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@blueprintjs/core';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';

const CheckBoxSendTitleForMedia: FC = () => {
  const {
    mediaNewsUI: { sendTitleMedia, toggleSendTitleMedia },
  } = useMediaNewsStore();
  return (
    <Checkbox
      checked={sendTitleMedia}
      label="Отправлять названия медиа-ресурсов?"
      onChange={toggleSendTitleMedia}
    />
  );
};

export default observer(CheckBoxSendTitleForMedia);
