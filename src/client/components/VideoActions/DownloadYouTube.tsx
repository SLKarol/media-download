import type { FC, MouseEventHandler } from 'react';
import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import { TypeMedia } from '@/constants/media';
import { MediaActions } from '@/client/constants/mediaActions';
import type { SubTitlesInformation } from '@/types/media';

interface Props {
  idMedia: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  subtitles?: SubTitlesInformation[];
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
      <MenuItem
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
const DownloadYouTubeMedia: FC<Omit<Props, 'disabled'>> = ({ subtitles, idMedia, onClick }) => {
  return (
    <Menu>
      <MenuItem
        text="Видео c аудио"
        icon="media"
        data-id-media={idMedia}
        data-action={MediaActions.DOWNLOAD_MEDIA}
        data-youtube="1"
        data-youtube-media={TypeMedia.video}
        onClick={onClick as MouseEventHandler<HTMLElement>}
      />
      <MenuItem
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
            <MenuItem key={s.languageCode} text={s.languageName}>
              <TypesSubtitles
                idMedia={idMedia}
                onClick={onClick}
                subtitle={s}
                languageCode={s.languageCode}
              />
            </MenuItem>
          ))}
        </>
      ) : null}
    </Menu>
  );
};

/**
 * Основная кнопка действий над медиа из ютуба
 */
const DownloadYouTube: FC<Props> = ({ disabled, idMedia, onClick, subtitles }) => {
  return (
    <Popover2
      content={<DownloadYouTubeMedia idMedia={idMedia} subtitles={subtitles} onClick={onClick} />}
      placement="bottom-start"
      disabled={disabled}>
      <Button icon="download" name="download" title="Скачать" disabled={disabled} />
    </Popover2>
  );
};

export default DownloadYouTube;
