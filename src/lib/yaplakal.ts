import { rm, writeFile, readFile } from 'fs/promises';

import https from 'https';
import axios from 'axios';
import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';

import type { MediaSummaryPreview, YaplakalApiResponse } from '@/types/media';
import { HasPrevNextPage, MediaForumProperties } from '@/types/mediaForum';
import { getYouTubeInfo } from './youtube';

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
async function getInfoFromIframe(
  url: string,
  permalink: string,
): Promise<Partial<MediaSummaryPreview>> {
  const re: Partial<MediaSummaryPreview> = {};
  const arrayUrl = url.split('=');
  re.id = arrayUrl[arrayUrl.length - 1];
  re.idVideoSource = 'www.yaplakal.com';
  re.permalink = `/${permalink}`;
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

async function getInfoFromDiv(
  url: string,
  permalink: string,
): Promise<Partial<MediaSummaryPreview>> {
  const re: Partial<MediaSummaryPreview> = {};
  re.idVideoSource = 'www.yaplakal.com';
  re.permalink = `/${permalink}`;
  const response = await axios.get(url, { httpsAgent, responseType: 'text' });
  const root = parse(response.data);
  const html = root.toString();
  const indxBegin = html.indexOf('https://api.yapfiles.ru/load/');
  const indxEnd = html.indexOf('&type=json', indxBegin);
  if (indxBegin === -1 || indxEnd === -1) return re;
  const urlJson = `${html.substring(indxBegin, indxEnd)}&type=json`;
  const jsonData = await axios.get<YaplakalApiResponse>(urlJson, { responseType: 'json' });
  const data = decodeYapJson(jsonData.data);
  Object.assign(re, data);
  return re;
}

// todo delete
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
    permalink: url.replace('https://www.yaplakal.com', ''),
  };
  /**
   * У ЯП два способа хранения видео: Через iframe и через div.
   */
  const iframe = root.querySelector('iframe');
  const divs = root.querySelectorAll('div[rel="yapfiles"]');
  let moreInfo: Partial<MediaSummaryPreview> = {};
  if (divs.length) {
    // Взять только первый элемент
    const [firstDiv] = divs;
    const id = firstDiv.getAttribute('id').replace(/^yfp-[0-9]+-/, '');
    const yapFileUrl = `https://api.yapfiles.ru/get_player/?v=${id}`;
    moreInfo = await getInfoFromDiv(yapFileUrl, '');
  } else if (iframe) {
    let iframeUrl = iframe.getAttribute('src');
    if (!iframeUrl.startsWith('http')) {
      iframeUrl = `https:${iframeUrl}`;
    }
    moreInfo = await getInfoFromIframe(iframeUrl, '');
  } else Object.assign(re, moreInfo);
  return re;
}

/**
 * map-функция для перевода HTML страницы в объект о форуме
 */
function mapForumContainer(forunContainer: HTMLElement): MediaForumProperties | null {
  // Получить ссылку на запись форума
  const link = forunContainer.querySelector('a.subtitle');
  if (!link) return null;
  // Название форума
  const name = link.text;
  // Когда создан
  const created = link.getAttribute('title');

  // Получить ссылку на последнюю страницу форума
  const lastHrefPage = forunContainer.querySelector('span.small a:last-child');
  // Есть есть такая ссылка, то получить из неё текстовую запись номера страницы
  const lastHrefText = lastHrefPage ? lastHrefPage.text.replace('...', '') : '';

  return {
    href: link.getAttribute('href').replace('//www.yaplakal.com/', ''),
    name,
    created,
    countPages: lastHrefText ? parseInt(lastHrefText, 10) : 1,
  };
}

/**
 * Получить медиа-картинку из ссылки
 */
function getYapMediaImageFromLink(aElement: HTMLElement, permalink: string) {
  let href = aElement.getAttribute('href');
  if (!href.startsWith('http')) {
    href = `https:${href}`;
  }
  const re: Partial<MediaSummaryPreview> = {};
  re.idVideoSource = 'www.yaplakal.com';
  re.permalink = `/${permalink}`;
  re.url = href;
  re.id = href;
  const img = aElement.querySelector('img');
  if (img) {
    re.title = img.getAttribute('alt');
    let src = img.getAttribute('src');
    if (!src.startsWith('http')) {
      src = `https:${src}`;
    }

    re.previewImages = { src };
  }
  re.haveVideo = false;

  return re;
}

function getYapMediaImageFromImg(iElement: HTMLElement, permalink: string) {
  const re: Partial<MediaSummaryPreview> = {};
  re.idVideoSource = 'www.yaplakal.com';
  re.permalink = `/${permalink}`;
  let src = iElement.getAttribute('src');
  if (!src.startsWith('http')) {
    src = `https:${src}`;
  }
  re.id = src;
  re.url = src;
  re.title = iElement.getAttribute('alt');
  re.previewImages = { src };
  re.haveVideo = false;
  return re;
}

/**
 * Получить список новых записей из YaP
 */
export async function getListNews(rootPage: HTMLElement): Promise<MediaForumProperties[]> {
  try {
    // Данные о форумах в ЯП в третьей ячейке таблицы
    const forumContainers = rootPage.querySelectorAll('table tr>td:nth-child(3)');
    const re = forumContainers.map(mapForumContainer).filter((f) => !!f);
    return re;
  } catch (e) {
    return null;
  }
}

/**
 * Получить все медиа из ЯП-топика
 */
export async function getMediaFromTopic(rootPage: HTMLElement, urlTopic: string) {
  const mediaElements = rootPage.querySelectorAll(
    "div[rel='yapfiles'], iframe:not(#vkwidget1), a.basic-img.attach, div.attach>img",
  );
  const promises = mediaElements.map((element) => {
    const tag = element.tagName.toLowerCase();
    // Обработка видео из iframe
    if (tag === 'iframe') {
      let url = element.getAttribute('src');
      if (!url.startsWith('http')) {
        url = `https:${url}`;
      }
      if (url.includes('www.youtube.com')) {
        return getYouTubeInfo(url);
      }
      if (url.includes('yapfiles')) {
        return getInfoFromIframe(url, urlTopic);
      }
      return null;
    }
    // Обработка видео из div[rel='yapfiles']
    if (tag === 'div') {
      const id = element.getAttribute('id').replace(/^yfp-[0-9]+-/, '');
      const url = `https://api.yapfiles.ru/get_player/?v=${id}`;
      return getInfoFromDiv(url, urlTopic);
    }
    // Обработка картинок из a.basic-img.attach
    if (tag === 'a') {
      return getYapMediaImageFromLink(element, urlTopic);
    }
    if (tag === 'img') {
      return getYapMediaImageFromImg(element, urlTopic);
    }

    return null;
  });

  return Promise.allSettled(promises).then((resPromises) =>
    resPromises
      .map((result) => {
        // Оставить только то, что отработало без ошибок
        const { status } = result;
        if (status === 'fulfilled') {
          const { value } = result;
          return value || null;
        }
        return null;
      })
      // Оставить не-null
      .filter((r) => r),
  );
}

export function getPageInfo(rootPage: HTMLElement): HasPrevNextPage {
  // Получить DIV с постраничным листанием
  const divPage = rootPage.querySelector('.bottommenu').previousElementSibling;
  if (!divPage) {
    return { next: false, prev: false, current: 0 };
  }
  // Получить <B>[Текущая страница]</B>
  const currentElement = divPage.querySelector('b');
  const currentPageNumber = Number.parseInt(currentElement.rawText.replace(/[\])}[{(]/g, ''), 10);
  const nextElement = currentElement.nextElementSibling;
  // Если в следующей ссылке есть img, значит это последняя страница
  const next = !nextElement.querySelector('img');
  const prevElement = currentElement.previousElementSibling;
  // Если в предыдущей ссылке текст "Страниц...", значит я не первой странице
  const prev = !prevElement.rawText.includes('Страниц');
  return { next, prev, current: currentPageNumber };
}
