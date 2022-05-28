import axios from 'axios';
import { parse } from 'node-html-parser';

import type { RedGifsJson, MediaSummary } from '@/types/media';
import { decodeImageUrlTo64 } from './images';
import { VIDEO_SOURCES } from '@/constants/videoSrc';

const urlPattern = VIDEO_SOURCES.get('www.redgifs.com').pattern;

export async function downloadRedGifsInfo(url: string): Promise<MediaSummary> {
  const htmlPage = await axios.get(url, { responseType: 'text' });
  const root = parse(htmlPage.data);
  const json = root.querySelector('script[type=application/ld+json]');
  const jsonData = JSON.parse(json.innerText) as RedGifsJson;
  const arrayName = urlPattern.exec(url)[0].split('/').reverse();

  const { thumbnailUrl, height, width, contentUrl, name } = jsonData.video;
  const decodedPreview = await decodeImageUrlTo64(thumbnailUrl);

  return {
    haveVideo: true,
    id: arrayName[0],
    idVideoSource: 'www.redgifs.com',
    over18: true,
    previewImages: { decoded: decodedPreview, src: thumbnailUrl },
    title: name,
    videoParts: { urlVideo: contentUrl },
    height,
    width,
    downloadedFileName: '',
    permalink: '',
  };
}
