import type { FC, MouseEventHandler } from 'react';
import { Button } from '@blueprintjs/core';

import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  idMedia: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const VoteMedia: FC<Props> = ({ idMedia, onClick, disabled }) => {
  return (
    <Button
      icon="thumbs-up"
      onClick={onClick}
      name="up"
      title="Проголосовать за видео"
      disabled={disabled}
      data-id-media={idMedia}
      data-action={MediaActions.VOTE}
    />
  );
};

export default VoteMedia;
