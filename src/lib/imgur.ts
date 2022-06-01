import axios from 'axios';
import { parse } from 'node-html-parser';

import type { MediaSummary } from '@/types/media';

export async function downloadImgurInfo(url: string): Promise<MediaSummary> {
  // Получить ID видео
  const id = url.split('/').reverse()[0].replace('.gifv', '');

  const htmlPage = await axios.get(`https://imgur.com/${id}`, { responseType: 'text' });
  const root = parse(htmlPage.data);
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
    permalink: '',
  };
}
