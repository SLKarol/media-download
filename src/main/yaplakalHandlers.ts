import type { IpcMainInvokeEvent } from 'electron';
import log from 'electron-log';
import { parse } from 'node-html-parser';

import { AppSignals } from '@/constants/signals';
import { getListNews, getMediaFromTopic, getPageInfo } from '@/lib/yaplakal';
import { getTextContent, decodeImageUrlTo64 } from '@/lib/net';

export async function getYaPlakalNews({ event, url }: { url: string; event: IpcMainInvokeEvent }) {
  try {
    const html = await getTextContent(url);
    const rootPage = parse(html);
    const listNews = await getListNews(rootPage);
    event.sender.send(AppSignals.YAPLAKAL_RESPONSE_NEWS, listNews);
  } catch (err) {
    event.sender.send(AppSignals.BACKEND_ERROR, err);
    log.error(err);
  }
}

export async function getYaplakalTopic({ event, url }: { url: string; event: IpcMainInvokeEvent }) {
  try {
    const html = await getTextContent(`https://www.yaplakal.com/${url}`);
    const rootPage = parse(html);
    const withoutImage = await getMediaFromTopic(rootPage, url);
    const pages = getPageInfo(rootPage);
    event.sender.send(AppSignals.YAPLAKAL_RESPONSE_TOPIC, { media: withoutImage, pages });

    // Получить постеры к каждой записи
    const promises = withoutImage.map((n) => {
      const { id, previewImages } = n;
      if (!previewImages) return null;

      return decodeImageUrlTo64(previewImages.src).then((decoded) => {
        return event.sender.send(AppSignals.YAPLAKAL_RESPONSE_TOPIC_PREVIEW, {
          id,
          preview: {
            decoded,
          },
        });
      });
    });
    await Promise.all(promises);
  } catch (err) {
    event.sender.send(AppSignals.BACKEND_ERROR, err);
  }
}

export async function getYaplakalTopicName({
  event,
  url,
}: {
  url: string;
  event: IpcMainInvokeEvent;
}): Promise<void> {
  try {
    const html = await getTextContent(`https://www.yaplakal.com/${url}`);
    const rootPage = parse(html);
    event.sender.send(AppSignals.YAPLAKAL_RESPONSE_TOPIC_NAME, {
      name: rootPage.querySelector('.subpage').innerText,
      href: url,
    });
  } catch (err) {
    log.error(err);
    event.sender.send(AppSignals.BACKEND_ERROR, err);
  }
}
