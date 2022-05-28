import axios from 'axios';
import { parse } from 'node-html-parser';

import type { MediaSummary, YaplakalApiResponse } from '@/types/media';
import { decodeImageUrlTo64 } from './images';

export async function downloadYapPageInfo(url: string): Promise<MediaSummary> {
  const htmlPage = await axios.get(url, { responseType: 'text' });
  const root = parse(htmlPage.data);
  const title = root.querySelector('h1#main-title.subpage');
  const re: MediaSummary = {
    title: title.textContent,
    haveVideo: false,
    id: '',
    idVideoSource: 'www.yaplakal.com',
    over18: false,
    previewImages: { decoded: '', src: '' },
    videoParts: { urlVideo: '' },
    downloadedFileName: '',
    permalink: '',
  };
  const iframe = root.querySelector('iframe');
  if (!iframe) return re;

  let iframeUrl = iframe.getAttribute('src');

  if (!iframeUrl.startsWith('http')) {
    iframeUrl = `https:${iframeUrl}`;
  }
  if (!iframeUrl) return re;

  const arrayUrl = iframeUrl.split('=');
  re.id = arrayUrl[arrayUrl.length - 1];
  const iframePage = await axios.get(iframeUrl, { responseType: 'text' });
  const rootIframePage = parse(iframePage.data);
  const scriptIframe = rootIframePage.querySelector('body>script').innerHTML;
  const indxBegin = scriptIframe.indexOf("url: 'https://api.yapfiles.ru/load/");
  const indxEnd = scriptIframe.indexOf('&type=json&ref=', indxBegin);
  if (indxBegin === -1 || indxEnd === -1) return re;
  const urlJson = `${scriptIframe.substring(indxBegin + 6, indxEnd)}&type=json`;
  const iframeJsonData = await axios.get<YaplakalApiResponse>(urlJson, { responseType: 'json' });

  const {
    player: { file, file_hd: fileHd, poster, res },
  } = iframeJsonData.data;
  const urlVideo = fileHd || file;
  const posterDecoded = await decodeImageUrlTo64(poster);

  re.haveVideo = !!urlVideo;
  re.previewImages.decoded = posterDecoded;
  re.previewImages.src = poster;
  re.videoParts.urlVideo = urlVideo;
  if (res) {
    const dimensions = res.split('x');
    if (dimensions.length === 2) {
      re.height = Number.parseInt(dimensions[1], 10);
      re.width = Number.parseInt(dimensions[0], 10);
    }
  }

  return re;
}
