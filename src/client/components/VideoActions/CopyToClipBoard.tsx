import type { FC, MouseEventHandler } from 'react';
import { Button } from '@blueprintjs/core';

import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  idMedia: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const CopyToClipBoard: FC<Props> = ({ idMedia, onClick }) => {
  return (
    <Button
      icon="clipboard"
      onClick={onClick}
      name="clipboard"
      title="Скопировать ссылку в буфер обмена"
      data-id-media={idMedia}
      data-action={MediaActions.COPY_TO_CLIP_BOARD}
    />
  );
};

export default CopyToClipBoard;
