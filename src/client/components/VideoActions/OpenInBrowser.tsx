import type { FC, MouseEventHandler } from 'react';
import { Button } from '@blueprintjs/core';

import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  idMedia: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const OpenInBrowser: FC<Props> = ({ idMedia, onClick }) => {
  return (
    <Button
      icon="document-open"
      onClick={onClick}
      name="open"
      title="Открыть в броузере"
      data-id-media={idMedia}
      data-action={MediaActions.OPEN_IN_BROWSER}
    />
  );
};

export default OpenInBrowser;
