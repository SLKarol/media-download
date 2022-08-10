import ytdl from 'ytdl-core';

import type { MediaSummary } from '@/types/media';

/**
 * Получить инфо о ютуб-ресурсе
 */
export async function downloadYouTubeInfo(url: string): Promise<MediaSummary> {
  const props = await ytdl.getInfo(url);

  const {
    videoDetails: { title, thumbnails, publishDate, chapters },
    player_response: { captions },
    formats,
  } = props;

  const posterUrl = thumbnails.length ? thumbnails[thumbnails.length - 1].url : '';
  const id = ytdl.getVideoID(url);
  // Сбор данных о субтитрах
  const captionTracks = captions ? captions.playerCaptionsTracklistRenderer.captionTracks : [];
  const subtitles = captionTracks.map(({ baseUrl, languageCode, name: { simpleText } }) => ({
    baseUrl,
    languageCode,
    languageName: simpleText,
  }));
  /**
   * Собрать инфу о доступных видеоформатах в таком виде:
   * Map("1080p", [код_кодека (https://en.wikipedia.org/wiki/YouTube#Quality_and_formats)])
   */
  const listFormats = new Map<string, number[]>();
  formats.forEach(({ hasVideo, itag, qualityLabel }) => {
    const format = listFormats.get(qualityLabel);
    if (format && hasVideo) {
      format.push(itag);
    }
    listFormats.set(qualityLabel, [itag]);
  });

  return {
    id,
    idVideoSource: 'www.youtube.com',
    haveVideo: true,
    title,
    previewImages: { decoded: '', src: posterUrl },
    over18: false,
    videoParts: { urlVideo: url },
    downloadedFileName: '',
    created: new Date(publishDate).toJSON(),
    permalink: `/watch?v=${id}`,
    subtitles: captions ? subtitles : undefined,
    chapters,
    listFormats,
  };
}
