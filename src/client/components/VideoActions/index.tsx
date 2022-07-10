import type { FC, MouseEventHandler } from 'react';
import { ButtonGroup } from '@blueprintjs/core';

import CopyToClipBoard from './CopyToClipBoard';
import OpenInBrowser from './OpenInBrowser';
import DownloadVideo from './DownloadVideo';
import VoteMedia from './VoteMedia';
import SendToTelegram from './SendToTelegram';
import DownloadYouTube from './DownloadYouTube';
import type { SubTitlesInformation } from '@/types/media';

interface Props {
  className?: string;
  /**
   * Недоступность кнопок
   */
  disabled?: boolean;
  idMedia: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  idVideoSource: string;
  subtitles?: SubTitlesInformation[];
}

const VideoActions: FC<Props> = ({
  className,
  disabled,
  idMedia,
  onClick,
  idVideoSource,
  subtitles,
}) => (
  <ButtonGroup className={className}>
    {idVideoSource === 'www.youtube.com' ? (
      <DownloadYouTube
        idMedia={idMedia}
        onClick={onClick}
        disabled={disabled}
        subtitles={subtitles}
      />
    ) : null}
    {idVideoSource !== 'www.youtube.com' ? (
      <DownloadVideo idMedia={idMedia} onClick={onClick} disabled={disabled} />
    ) : null}
    <SendToTelegram idMedia={idMedia} onClick={onClick} disabled={disabled} />
    <CopyToClipBoard idMedia={idMedia} onClick={onClick} />
    {idVideoSource === 'www.reddit.com' ? (
      <VoteMedia idMedia={idMedia} onClick={onClick} disabled={disabled} />
    ) : null}
    <OpenInBrowser idMedia={idMedia} onClick={onClick} />
  </ButtonGroup>
);

export default VideoActions;
