import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';

const ButtonSendMedias: FC = () => {
  const {
    mediaNewsUI: {
      countMediaToTelegram: { allSelected },
      enableSendHolidayName,
    },
    mediaNewsContentStore: { sendMediaToTg },
  } = useMediaNewsStore();
  const {
    holidaysStore: { selectedHoliday },
  } = useRootStore();

  const onClickSend = () => {
    if (!enableSendHolidayName) return sendMediaToTg();
    const message = `Сегодня у меня хорошее настроение, ведь сегодня отмечают праздник "${selectedHoliday}"`;
    return sendMediaToTg(message);
  };

  return (
    <Button icon="send-message" title="Отправить" onClick={onClickSend} disabled={!allSelected} />
  );
};

export default observer(ButtonSendMedias);
