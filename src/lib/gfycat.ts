import { parse } from 'path';

import type { GfycatResponse, MediaSummary } from '@/types/media';
import { getTextContent, urlExists } from './net';

/**
 * Разбор медиа из gfycat
 */
export async function downloadGfycatInfo(url: string): Promise<MediaSummary> {
  // Получить ID видео
  let { name: gfyid } = parse(url);
  // eslint-disable-next-line prefer-const
  let i = gfyid.indexOf('-');
  if (i > -1) {
    gfyid = gfyid.slice(0, i);
  }

  const response = await getTextContent(`https://api.gfycat.com/v1/gfycats/${gfyid}`);
  const data = JSON.parse(response) as GfycatResponse;

  const {
    createDate,
    gifUrl = '',
    mp4Url = '',
    height,
    gfyId,
    nsfw,
    title,
    width,
    posterUrl,
  } = data.gfyItem;
  const gifExist = await urlExists(gifUrl);

  // Еслине получилось взять gif, то назову это медиа видеоресурсом.
  return {
    haveVideo: !gifExist,
    id: gfyId,
    idVideoSource: 'gfycat.com',
    over18: nsfw,
    previewImages: { decoded: '', src: gifExist ? gifUrl : posterUrl },
    title,
    videoParts: { urlVideo: !gifExist ? mp4Url : '' },
    downloadedFileName: '',
    height,
    width,
    url: gifUrl,
    permalink: `/${gfyId}`,
    created: new Date(createDate * 1000).toJSON(),
  };
}
