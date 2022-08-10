import type { FC, MouseEventHandler } from 'react';
import { Button, Menu } from '@blueprintjs/core';
import { Popover2, MenuItem2 } from '@blueprintjs/popover2';

import { TypeMedia } from '@/constants/media';
import { MediaActions } from '@/client/constants/mediaActions';
import type { SubTitlesInformation } from '@/types/media';

interface Props {
  idMedia: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  subtitles?: SubTitlesInformation[];
  /**
   * "720p", "1080p" и т.д.
   */
  videoFormats?: string[];
}

interface PropsSubTitle {
  subtitle: SubTitlesInformation;
  idMedia: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  languageCode: string;
}

const TYPES_SUBTITLES = ['xml', 'ttml', 'vtt', 'srv1', 'srv2', 'srv3'];

/**
 * Список доступных субтитров
 */
const TypesSubtitles: FC<PropsSubTitle> = ({ idMedia, onClick, subtitle, languageCode }) => (
  <>
    {TYPES_SUBTITLES.map((s) => (
      <MenuItem2
        key={s}
        text={s}
        data-id-media={idMedia}
        data-action={MediaActions.DOWNLOAD_MEDIA}
        data-youtube="1"
        data-youtube-media={TypeMedia.subtitle}
        data-youtube-subtitle={subtitle.baseUrl}
        data-youtube-subtitle-type={s}
        data-youtube-subtitle-language-code={languageCode}
        onClick={onClick as MouseEventHandler<HTMLElement>}
      />
    ))}
  </>
);

/**
 * Список действия над ютуб-медиа-ресурсом
 */
const DownloadYouTubeMedia: FC<Omit<Props, 'disabled'>> = ({
  subtitles,
  idMedia,
  onClick,
  videoFormats = [],
}) => {
  return (
    <Menu>
      <MenuItem2
        text="Видео c аудио"
        icon="media"
        data-id-media={idMedia}
        data-action={MediaActions.DOWNLOAD_MEDIA}
        data-youtube="1"
        data-youtube-media={TypeMedia.video}>
        {videoFormats.map((f) => (
          <MenuItem2
            key={f}
            text={f}
            data-id-media={idMedia}
            data-action={MediaActions.DOWNLOAD_MEDIA}
            data-youtube="1"
            data-youtube-media={TypeMedia.video}
            data-video-quality={f}
            onClick={onClick as MouseEventHandler<HTMLElement>}
          />
        ))}
      </MenuItem2>
      <MenuItem2
        text="Только аудио"
        icon="music"
        data-id-media={idMedia}
        data-action={MediaActions.DOWNLOAD_MEDIA}
        data-youtube="1"
        data-youtube-media={TypeMedia.audio}
        onClick={onClick as MouseEventHandler<HTMLElement>}
      />
      {subtitles ? (
        <>
          <li className="bp4-menu-header">
            <h6 className="bp4-heading">Субтитры</h6>
          </li>
          {subtitles.map((s) => (
            <MenuItem2 key={s.languageCode} text={s.languageName}>
              <TypesSubtitles
                idMedia={idMedia}
                onClick={onClick}
                subtitle={s}
                languageCode={s.languageCode}
              />
            </MenuItem2>
          ))}
        </>
      ) : null}
    </Menu>
  );
};

/**
 * Основная кнопка действий над медиа из ютуба
 */
const DownloadYouTube: FC<Props> = ({ disabled, idMedia, onClick, subtitles, videoFormats }) => {
  return (
    <Popover2
      content={
        <DownloadYouTubeMedia
          idMedia={idMedia}
          subtitles={subtitles}
          onClick={onClick}
          videoFormats={videoFormats}
        />
      }
      placement="bottom-start"
      disabled={disabled}>
      <Button icon="download" name="download" title="Скачать" disabled={disabled} />
    </Popover2>
  );
};

export default DownloadYouTube;
