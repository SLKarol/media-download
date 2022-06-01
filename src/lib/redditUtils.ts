import type { ImagePreview, Media } from 'snoowrap/dist/objects/Submission';
import type { Submission } from 'snoowrap';

import { MediaPreview, VideoParts, MediaSummaryPreview } from '@/types/media';
import { decodeImageUrlTo64 } from '@/lib/images';
import { downloadRedGifsInfo } from '@/lib/redgifs';
import { downloadImgurInfo } from '@/lib/imgur';

const REGEXP_GIF_REDDIT = /https:\/\/i.redd.it\/\w+(.gif)?/;

interface ExtendSubmission extends Submission {
  crosspost_parent_list: [{ secure_media: Media }];
}

/**
 * Получить base64 содержимое картинки
 */
export async function getPreviewImage(preview: {
  images: ImagePreview[];
  redditUrl: string;
}): Promise<MediaPreview> {
  const re: MediaPreview = { decoded: '', src: '' };
  const prImages = preview && 'images' in preview ? preview.images : [];
  if (prImages.length === 0) {
    return re;
  }
  const previewData = prImages[0];
  const { redditUrl } = preview;
  // Загрузить главную картинку
  const { height, url, width } = previewData.source;
  if (!!redditUrl && REGEXP_GIF_REDDIT.test(redditUrl)) {
    re.decoded = await decodeImageUrlTo64(redditUrl);
    re.src = url;
    re.height = height;
    re.width = width;
    return re;
  }
  re.decoded = await decodeImageUrlTo64(url);
  re.src = url;
  re.height = height;
  re.width = width;
  return re;
}

/**
 * Реддит-заметка содержит видео?
 */
export function checkHaveVideo(url: string, media: Media) {
  if (url.match(/.(gifv)$/i)) return true;
  if (!media) return false;
  const { type = '' } = media;
  if (type === 'redgifs.com') return true;
  const fallbackUrl = media?.reddit_video?.fallback_url;
  if (fallbackUrl) {
    const urlVideo = fallbackUrl.split('?')[0];
    const fileName = urlVideo.substring(urlVideo.lastIndexOf('/') + 1);
    if (fileName.startsWith('DASH_')) {
      return true;
    }
  }
  return false;
}

/**
 * @param {Object} record Запись из reddit
 * @param {string} record.url Ссылка на видео
 * @param {string} record.title Название видео
 * @param {Object} record.media Скомбинированная инфа о видео
 * @return {Promise} videoRecords
 */
export function getVideoUrl(record: Partial<Submission>): VideoParts | null {
  const { url = '', media } = record;
  // Это gifv?
  if (url.match(/.(gifv)$/i)) {
    return { urlVideo: url.replace('.gifv', '.mp4') };
  }
  // В остальных случаях должен быть объект media
  if (!media) {
    return null;
  }

  // Это обычное видео?
  const fallbackUrl = media?.reddit_video?.fallback_url;

  if (fallbackUrl) {
    const urlVideo = fallbackUrl.split('?')[0];
    const fileName = urlVideo.substring(urlVideo.lastIndexOf('/') + 1);
    if (!fileName.startsWith('DASH_')) {
      return null;
    }
    const urlAudio = urlVideo.replace(fileName, 'DASH_audio.mp4');
    return { urlVideo, urlAudio };
  }
  return null;
}

/**
 * Разобрать запись для вывода на экран
 */
export async function parseSubmissionInfo(submission: Submission): Promise<MediaSummaryPreview> {
  // Получить основное инфо
  const {
    id,
    title,
    preview,
    subreddit: { display_name: subRedditDisplayName },
    over_18: over18,
    secure_media: media,
    crosspost_parent_list: crosspostParentList,
    url,
    permalink,
  } = submission as ExtendSubmission;
  // media может быть не своё, а из репоста
  let videoMedia: Media | null = media;
  if (!videoMedia && Array.isArray(crosspostParentList) && crosspostParentList.length) {
    videoMedia = crosspostParentList[0].secure_media;
  }

  // Если видео размещено на redgifs.com, то так взять инфу:
  if (videoMedia && 'type' in videoMedia && videoMedia.type === 'redgifs.com') {
    const {
      haveVideo,
      videoParts,
      height: h,
      width: w,
      previewImages,
    } = await downloadRedGifsInfo(url);
    return {
      id,
      haveVideo,
      videoParts,
      title,
      subReddit: subRedditDisplayName,
      over18,
      height: h,
      width: w,
      idVideoSource: 'www.reddit.com',
      permalink,
      url,
      downloadedFileName: '',
      previewImages,
      preview,
    };
  }

  // Если видео на imgur, то так взять инфу:
  if (url.includes('imgur.com')) {
    const {
      haveVideo,
      videoParts,
      height: h,
      width: w,
      previewImages,
    } = await downloadImgurInfo(url);
    return {
      id,
      haveVideo,
      videoParts,
      title,
      subReddit: subRedditDisplayName,
      over18,
      height: h,
      width: w,
      idVideoSource: 'www.reddit.com',
      permalink,
      url,
      downloadedFileName: '',
      previewImages,
      preview,
    };
  }

  // Попытки взять видео из других источников
  let height: number;
  let width: number;
  let dimensionPropName: 'reddit_video' | 'oembed';

  if (videoMedia && 'reddit_video' in videoMedia) {
    dimensionPropName = 'reddit_video';
  }
  if (videoMedia && 'oembed' in videoMedia) {
    dimensionPropName = 'oembed';
  }
  if (dimensionPropName) {
    width = (videoMedia[dimensionPropName] as { width: number }).width;
    height = videoMedia[dimensionPropName].height;
  }

  const videoParts = await getVideoUrl({ url, media: videoMedia });

  return {
    id,
    haveVideo: checkHaveVideo(url, videoMedia),
    videoParts,
    title,
    subReddit: subRedditDisplayName,
    over18,
    height,
    width,
    idVideoSource: 'www.reddit.com',
    permalink,
    url,
    downloadedFileName: '',
    previewImages: { height, width },
    preview,
  };
}
