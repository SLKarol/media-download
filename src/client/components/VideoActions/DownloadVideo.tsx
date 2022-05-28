import type { FC, MouseEventHandler } from 'react';
import { Button } from '@blueprintjs/core';

import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  idMedia: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const DownloadVideo: FC<Props> = ({ disabled, idMedia, onClick }) => {
  return (
    <Button
      icon="download"
      onClick={onClick}
      name="download"
      title="Скачать"
      disabled={disabled}
      data-id-media={idMedia}
      data-action={MediaActions.DOWNLOAD_MEDIA}
    />
  );
};

export default DownloadVideo;
