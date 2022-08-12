import { parse } from 'node-html-parser';
import type { Submission } from 'snoowrap';

import type { RedGifsJson, MediaSummaryPreview } from '@/types/media';
import { VIDEO_SOURCES } from '@/constants/videoSrc';
import { getTextContent } from './net';

const urlPattern = VIDEO_SOURCES.get('www.redgifs.com').pattern;

export async function downloadRedGifsInfo(url: string): Promise<MediaSummaryPreview> {
  const htmlPage = await getTextContent(url);
  const root = parse(htmlPage);
  const json = root.querySelector('script[type=application/ld+json]');
  const jsonData = JSON.parse(json.innerText) as RedGifsJson;
  const arrayName = urlPattern.exec(url)[0].split('/').reverse();

  const { thumbnailUrl, height, width, contentUrl, name } = jsonData.video;

  return {
    haveVideo: true,
    id: arrayName[0],
    idVideoSource: 'www.redgifs.com',
    over18: true,
    previewImages: { src: thumbnailUrl },
    title: name,
    videoParts: { urlVideo: contentUrl },
    height,
    width,
    downloadedFileName: '',
    permalink: '',
  };
}

export function parseRedGifsUrl(record: Partial<Submission>) {
  const { media } = record;
  // Если пустое media, значит url отправить
  if (media === null) {
    return record.url;
  }
  if ('media' in record) {
    // Порядок парсинга урла такой: сперва thumbnail_url, затем html
    const thumbnailUrl = media?.oembed?.thumbnail_url || '';
    // Если есть thumbnailUrl, то разобрать его
    if (thumbnailUrl) {
      // Изменить расширение у превью на .mp4
      return `${thumbnailUrl.substring(0, thumbnailUrl.lastIndexOf('.'))}.mp4`;
    }
    // Если есть html, то его разобрать
    const html = media?.oembed?.html || '';
    if (html) {
      const iframe = parse(html).querySelector('iframe');
      if (iframe) {
        return iframe.getAttribute('src') || '';
      }
    }
  }
  return record.url || '';
}
