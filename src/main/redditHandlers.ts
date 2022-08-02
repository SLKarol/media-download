import type { IpcMainInvokeEvent } from 'electron';

import { AppSignals } from '@/constants/signals';
import type { Reddit } from '@/lib/reddit';
import { decodeImageUrlTo64 } from '@/lib/net';
import { getImagesCollection } from '@/lib/redditUtils';

/**
 * Запросить список моих подписок
 */
export async function getMySubreddit({ reddit }: { reddit: Reddit }) {
  const re = await reddit.mySubreddits();
  return re;
}

export async function getRedditNews({
  event,
  reddit,
  channel,
  after,
  limit,
}: {
  channel: string;
  event: IpcMainInvokeEvent;
  reddit: Reddit;
  after: string | null;
  limit: number;
}): Promise<unknown> {
  try {
    // Получить новые записи из reddit
    const { after: afterResult, data } = await reddit.getNewRecords({
      channel,
      limit,
      after,
    });
    const records = data.filter(({ preview, collection }) => !!preview || !!collection);
    // Отправить новые записи клиенту
    event.sender.send(AppSignals.REDDIT_RESPONSE_NEWS, { records, after: afterResult, channel });

    // Получить постеры к каждой записи
    const promises = records.map((n) => {
      const { id, preview, collection } = n;
      // Если запись из Reddit с альбомом:
      if (collection) {
        return getImagesCollection(collection).then((loadedCollection) =>
          event.sender.send(AppSignals.SEND_MEDIA_GROUP_COLLECTION, {
            id,
            collection: loadedCollection,
          }),
        );
      }
      // Иначе, если обычная запись без альбома:
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
  }
  return undefined;
}
