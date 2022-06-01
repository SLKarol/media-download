import type { IpcMainInvokeEvent } from 'electron';

import { AppSignals } from '@/constants/signals';
import type { Reddit } from '@/lib/reddit';
import { decodeImageUrlTo64 } from '@/lib/images';

/**
 * Запросить список моих подписок
 */
export async function getMySubreddit({
  event,
  reddit,
}: {
  event: IpcMainInvokeEvent;
  reddit: Reddit;
}): Promise<void> {
  try {
    event.sender.send(AppSignals.BACKEND_BUSY, true);
    const subscribes = await reddit.mySubreddits();
    event.sender.send(AppSignals.REDDIT_RESPONSE_MY_REDDITS, Array.from(subscribes));
  } catch (err) {
    event.sender.send(AppSignals.BACKEND_ERROR, err);
  } finally {
    event.sender.send(AppSignals.BACKEND_BUSY, false);
  }
  return undefined;
}

export async function getRedditNews({
  event,
  reddit,
  channel,
}: {
  channel: string;
  event: IpcMainInvokeEvent;
  reddit: Reddit;
}): Promise<unknown> {
  try {
    event.sender.send(AppSignals.BACKEND_BUSY, true);
    // Получить новые записи из reddit
    const news = await reddit.getNewRecords(channel);
    const withoutImage = news.filter(({ preview }) => !!preview);
    // Отправить новые записи клиенту
    event.sender.send(AppSignals.REDDIT_RESPONSE_NEWS, withoutImage);
    // Получить постеры к каждой записи
    const promises = withoutImage.map((n) => {
      const { id, preview } = n;
      if ('images' in preview && preview.images.length) {
        const [firstImage] = preview.images;
        const {
          source: { height, url, width },
        } = firstImage;
        return decodeImageUrlTo64(url).then((decoded) => {
          return event.sender.send(AppSignals.SEND_MEDIA_GROUP_PREVIEW, {
            id,
            preview: {
              decoded,
              src: url,
              height,
              width,
            },
          });
        });
      }
      return null;
    });
    return await Promise.all(promises);
  } catch (err) {
    event.sender.send(AppSignals.BACKEND_ERROR, err);
  } finally {
    event.sender.send(AppSignals.BACKEND_BUSY, false);
  }
  return undefined;
}
