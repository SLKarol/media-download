import type { FC, MouseEventHandler } from 'react';
import { ButtonGroup } from '@blueprintjs/core';

import CopyToClipBoard from './CopyToClipBoard';
import OpenInBrowser from './OpenInBrowser';
import DownloadVideo from './DownloadVideo';
import VoteMedia from './VoteMedia';
import SendToTelegram from './SendToTelegram';

interface Props {
  className?: string;
  /**
   * Недоступность кнопок
   */
  disabled?: boolean;
  idMedia: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  /**
   * Показывать кнопку "Проголосовать"?
   */
  visibleVote?: boolean;
}

const VideoActions: FC<Props> = ({
  className,
  disabled,
  idMedia,
  onClick,
  visibleVote = false,
}) => (
  <ButtonGroup className={className}>
    <DownloadVideo idMedia={idMedia} onClick={onClick} disabled={disabled} />
    <SendToTelegram idMedia={idMedia} onClick={onClick} disabled={disabled} />
    <CopyToClipBoard idMedia={idMedia} onClick={onClick} />
    {visibleVote && <VoteMedia idMedia={idMedia} onClick={onClick} disabled={disabled} />}
    <OpenInBrowser idMedia={idMedia} onClick={onClick} />
  </ButtonGroup>
);

export default VideoActions;
