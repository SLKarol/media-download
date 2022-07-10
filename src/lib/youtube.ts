import ytdl from 'ytdl-core';
import type { MediaSummary } from '@/types/media';

/**
 * Получить инфо о ютуб-ресурсе
 */
export async function downloadYouTubeInfo(url: string): Promise<MediaSummary> {
  const {
    videoDetails: { title, thumbnails, publishDate },
    player_response: { captions },
  } = await ytdl.getInfo(url);

  const posterUrl = thumbnails.length ? thumbnails[thumbnails.length - 1].url : '';
  const id = ytdl.getVideoID(url);
  // Сбор данных о субтитрах
  const captionTracks = captions ? captions.playerCaptionsTracklistRenderer.captionTracks : [];
  const subtitles = captionTracks.map(({ baseUrl, languageCode, name: { simpleText } }) => ({
    baseUrl,
    languageCode,
    languageName: simpleText,
  }));

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
  };
}
