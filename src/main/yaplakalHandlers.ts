import https from 'https';
import type { IpcMainInvokeEvent } from 'electron';
import axios from 'axios';
import { parse } from 'node-html-parser';

import { AppSignals } from '@/constants/signals';
import { getListNews, getMediaFromTopic, getPageInfo } from '@/lib/yaplakal';
import { decodeImageUrlTo64 } from '@/lib/images';

const httpsAgent = new https.Agent({ keepAlive: true });

export async function getYaPlakalNews({ event, url }: { url: string; event: IpcMainInvokeEvent }) {
  event.sender.send(AppSignals.BACKEND_BUSY, true);
  try {
    const page = await axios.get(url, { httpsAgent, responseType: 'text' });
    const rootPage = parse(page.data);
    const listNews = await getListNews(rootPage);
    event.sender.send(AppSignals.YAPLAKAL_RESPONSE_NEWS, listNews);
  } catch (err) {
    event.sender.send(AppSignals.BACKEND_ERROR, err);
  } finally {
    event.sender.send(AppSignals.BACKEND_BUSY, false);
  }
}

export async function getYaplakalTopic({ event, url }: { url: string; event: IpcMainInvokeEvent }) {
  event.sender.send(AppSignals.BACKEND_BUSY, true);
  try {
    const page = await axios.get(`https://www.yaplakal.com/${url}`, {
      httpsAgent,
      responseType: 'text',
    });
    const rootPage = parse(page.data);
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
  } finally {
    event.sender.send(AppSignals.BACKEND_BUSY, false);
  }
}
