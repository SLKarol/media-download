import https from 'https';
import axios from 'axios';
import { parse } from 'node-html-parser';

import type { MediaSummaryPreview, YaplakalApiResponse } from '@/types/media';

const httpsAgent = new https.Agent({ keepAlive: true });

function decodeYapJson(data: YaplakalApiResponse) {
  const re: Partial<MediaSummaryPreview> = {};
  const {
    player: { file, file_hd: fileHd, poster, res },
  } = data;

  const urlVideo = fileHd || file;

  if (res) {
    const dimensions = res.split('x');
    if (dimensions.length === 2) {
      re.height = Number.parseInt(dimensions[1], 10);
      re.width = Number.parseInt(dimensions[0], 10);
    }
  }

  re.haveVideo = !!urlVideo;
  re.previewImages = { src: poster };
  re.videoParts = { urlVideo };
  return re;
}

/**
 * Скачивание медиа-инфо из ЯП-фрейма
 */
async function getInfoFromIframe(url: string): Promise<Partial<MediaSummaryPreview>> {
  const re: Partial<MediaSummaryPreview> = {};
  const arrayUrl = url.split('=');
  re.id = arrayUrl[arrayUrl.length - 1];
  const iframePage = await axios.get(url, { httpsAgent, responseType: 'text' });
  const rootIframePage = parse(iframePage.data);
  const scriptIframe = rootIframePage.querySelector('body>script').innerHTML;
  const indxBegin = scriptIframe.indexOf("url: 'https://api.yapfiles.ru/load/");
  const indxEnd = scriptIframe.indexOf('&type=json&ref=', indxBegin);
  if (indxBegin === -1 || indxEnd === -1) return re;
  const urlJson = `${scriptIframe.substring(indxBegin + 6, indxEnd)}&type=json`;
  const iframeJsonData = await axios.get<YaplakalApiResponse>(urlJson, { responseType: 'json' });

  const data = decodeYapJson(iframeJsonData.data);
  Object.assign(re, data);

  return re;
}

async function getInfoFromDiv(url: string): Promise<Partial<MediaSummaryPreview>> {
  const re: Partial<MediaSummaryPreview> = {};
  const response = await axios.get(url, { httpsAgent, responseType: 'text' });
  const root = parse(response.data);
  const html = root.toString();
  // await writeFile('yap2.html', html);
  const indxBegin = html.indexOf('https://api.yapfiles.ru/load/');
  const indxEnd = html.indexOf('&type=json', indxBegin);
  if (indxBegin === -1 || indxEnd === -1) return re;
  const urlJson = `${html.substring(indxBegin, indxEnd)}&type=json`;
  const jsonData = await axios.get<YaplakalApiResponse>(urlJson, { responseType: 'json' });
  const data = decodeYapJson(jsonData.data);
  Object.assign(re, data);
  return re;
}

export async function downloadYapPageInfo(url: string): Promise<MediaSummaryPreview> {
  const htmlPage = await axios.get(url, { httpsAgent, responseType: 'text' });
  const root = parse(htmlPage.data);
  const title = root.querySelector('h1#main-title.subpage');
  const re: MediaSummaryPreview = {
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
  /**
   * У ЯП два способа хранения видео: Через iframe и через div.
   */
  const iframe = root.querySelector('iframe');
  const divs = root.querySelectorAll('div[rel="yapfiles"]');
  let moreInfo: Partial<MediaSummaryPreview> = {};
  if (iframe) {
    let iframeUrl = iframe.getAttribute('src');
    if (!iframeUrl.startsWith('http')) {
      iframeUrl = `https:${iframeUrl}`;
    }
    moreInfo = await getInfoFromIframe(iframeUrl);
  } else if (divs.length) {
    // Взять только первый элемент
    const [firstDiv] = divs;
    const id = firstDiv.getAttribute('id').replace(/^yfp-[0-9]+-/, '');
    const yapFileUrl = `https://api.yapfiles.ru/get_player/?v=${id}`;
    moreInfo = await getInfoFromDiv(yapFileUrl);
  }

  Object.assign(re, moreInfo);
  return re;
}
