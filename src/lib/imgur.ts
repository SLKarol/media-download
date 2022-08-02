import { parse as parsePath } from 'path';
import { parse } from 'node-html-parser';

import type { MediaSummary } from '@/types/media';
import { getTextContent } from './net';

export async function downloadImgurInfo(url: string): Promise<MediaSummary> {
  // Получить ID видео
  const { name: id } = parsePath(url);

  const htmlPage = await getTextContent(`https://imgur.com/${id}`);
  const root = parse(htmlPage);
  // Найти тэг с постером
  const posterTag = root.querySelector('meta[name="twitter:image"]');
  const posterUrl = posterTag ? posterTag.getAttribute('content') : '';

  let element = root.querySelector('meta[name="twitter:player:height"]');
  const height = element ? parseInt(element.getAttribute('content'), 10) : undefined;
  element = root.querySelector('meta[name="twitter:player:width"]');
  const width = element ? parseInt(element.getAttribute('content'), 10) : undefined;
  element = root.querySelector('meta[name="twitter:player:stream"]');
  const urlVideo = element ? element.getAttribute('content') : '';
  element = root.querySelector('title');
  const title = element.innerText.replace(' - GIF on Imgur', '');

  return {
    haveVideo: !!urlVideo,
    id,
    idVideoSource: 'imgur.com',
    previewImages: { decoded: '', src: posterUrl },
    title,
    height,
    width,
    videoParts: { urlVideo },
    over18: false,
    downloadedFileName: '',
    permalink: id,
  };
}
