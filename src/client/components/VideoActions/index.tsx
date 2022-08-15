import type { FC, MouseEventHandler } from 'react';
import { ButtonGroup } from '@blueprintjs/core';

import CopyToClipBoard from './CopyToClipBoard';
import OpenInBrowser from './OpenInBrowser';
import DownloadVideo from './DownloadVideo';
import VoteMedia from './VoteMedia';
import SendToTelegram from './SendToTelegram';
import DownloadYouTube from './DownloadYouTube';
import DownloadChapters from './DownloadChapters';

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
  /**
   * Если возможность разбить на части?
   */
  hasChapters?: boolean;
  /**
   * "720p", "1080p" и т.д.
   */
  videoFormats?: string[];
  /**
   * Не содержит мультимедиа?
   */
  noMedia?: boolean;
}

const VideoActions: FC<Props> = ({
  className,
  disabled,
  idMedia,
  onClick,
  idVideoSource,
  subtitles,
  hasChapters,
  videoFormats,
  noMedia,
}) => (
  <ButtonGroup className={className}>
    {!noMedia && idVideoSource === 'www.youtube.com' ? (
      <>
        <DownloadYouTube
          idMedia={idMedia}
          onClick={onClick}
          disabled={disabled}
          subtitles={subtitles}
          videoFormats={videoFormats}
        />
        {hasChapters ? (
          <DownloadChapters idMedia={idMedia} onClick={onClick} disabled={disabled} />
        ) : null}
      </>
    ) : null}
    {!noMedia && idVideoSource !== 'www.youtube.com' ? (
      <DownloadVideo idMedia={idMedia} onClick={onClick} disabled={disabled} />
    ) : null}
    {!noMedia ? <SendToTelegram idMedia={idMedia} onClick={onClick} disabled={disabled} /> : null}
    <CopyToClipBoard idMedia={idMedia} onClick={onClick} />
    {!noMedia && idVideoSource === 'www.reddit.com' ? (
      <VoteMedia idMedia={idMedia} onClick={onClick} disabled={disabled} />
    ) : null}
    <OpenInBrowser idMedia={idMedia} onClick={onClick} />
  </ButtonGroup>
);

export default VideoActions;
