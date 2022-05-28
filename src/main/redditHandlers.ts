import type { IpcMainInvokeEvent } from 'electron';
import fs from 'fs/promises';

import { AppSignals } from '@/constants/signals';
import type { Reddit } from '@/lib/reddit';

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
}): Promise<void> {
  try {
    event.sender.send(AppSignals.BACKEND_BUSY, true);
    //! В рабочей версии убрать коммент
    const news = await reddit.getNewRecords(channel);

    // fs.writeFile(`${channel}.json`, JSON.stringify(news), { encoding: 'utf8' });

    // const t = await fs.readFile('PornStars.json');
    // const news = JSON.parse(t.toString());

    event.sender.send(AppSignals.REDDIT_RESPONSE_NEWS, news);
  } catch (err) {
    event.sender.send(AppSignals.BACKEND_ERROR, err);
  } finally {
    event.sender.send(AppSignals.BACKEND_BUSY, false);
  }
  return undefined;
}
