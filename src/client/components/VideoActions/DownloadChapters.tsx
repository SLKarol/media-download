import type { FC, MouseEventHandler } from 'react';
import { Button } from '@blueprintjs/core';

import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  idMedia: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Выбрать части медиаконтента
 */
const DownloadChapters: FC<Props> = ({ disabled, idMedia, onClick }) => {
  return (
    <Button
      icon="property"
      onClick={onClick}
      name="download"
      title="Скачать с разбиением на части"
      disabled={disabled}
      data-id-media={idMedia}
      data-action={MediaActions.SELECT_CHAPTERS}
    />
  );
};

export default DownloadChapters;
