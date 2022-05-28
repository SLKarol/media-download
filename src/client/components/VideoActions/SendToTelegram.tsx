import type { FC, MouseEventHandler } from 'react';
import { Button } from '@blueprintjs/core';

import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  idMedia: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const SendToTelegram: FC<Props> = ({ idMedia, onClick, disabled }) => {
  return (
    <Button
      icon="send-message"
      onClick={onClick}
      name="open"
      title="Отправить в телеграм (выполняется после того, как медиа скачено)"
      disabled={disabled}
      data-id-media={idMedia}
      data-action={MediaActions.SEND_TO_TELEGRAM}
    />
  );
};

export default SendToTelegram;
