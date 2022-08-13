import Snoowrap from 'snoowrap';
import type Store from 'electron-store';

import { VIDEO_SOURCES } from '@/constants/videoSrc';
import { MediaSummaryPreview } from '@/types/media';
import type { Settings } from '@/types/settings';

import { parseSubmissionInfo } from './redditUtils';

export class Reddit {
  private client: Snoowrap | null;

  private patternUrl: RegExp;

  // eslint-disable-next-line no-unused-vars
  constructor(private store: Store<Settings>) {
    this.reConnect();
    this.patternUrl = VIDEO_SOURCES.get('www.reddit.com').pattern;
  }

  /**
   * Плоучение инфы о реддит-заметке
   */
  getInfo = (props: { urlReddit: string }) => {
    const { urlReddit } = props;
    const urlId = this.getSubmissionId(urlReddit);

    // Получить данные о записи реддита
    const subRecord = this.client.getSubmission(urlId);
    // Поскольку библиотека snoowrap очень странно работает с промисами,
    // (так что TS ругается на ошибки),
    // То получение данных о видео будет идти через цепочки .then
    return subRecord
      .fetch()
      .then((submission) => parseSubmissionInfo(submission))
      .catch((err) => {
        throw new Error(err);
      });
  };

  /**
   * Получение ID заметки из урла реддита
   */
  private getSubmissionId = (urlReddit: string) => {
    return this.patternUrl.exec(urlReddit)[0].split('/').reverse()[2];
  };

  /**
   * ПереПодключение к реддиту
   */
  reConnect() {
    const redditUserName = this.store.get('redditUserName');
    const redditApiSecret = this.store.get('redditApiSecret');
    const redditAppId = this.store.get('redditAppId');
    const redditPassword = this.store.get('redditPassword');
    if (
      redditUserName.length &&
      redditApiSecret.length &&
      redditAppId.length &&
      redditPassword.length
    ) {
      const userAgent = `Node.js/16.14.2:snoowrap:v1.23.0 (by /u/${redditUserName})`;
      this.client = new Snoowrap({
        userAgent,
        clientId: redditAppId,
        clientSecret: redditApiSecret,
        username: redditUserName,
        password: redditPassword,
      });
    }
  }

  /**
   * Отправить голос за публикацию
   */
  sendVote = (idRecord: string) => {
    const { client } = this;
    const subRecord = client.getSubmission(idRecord);
    return subRecord
      .fetch()
      .then((result) => result.upvote())
      .catch(() => false);
  };

  /**
   * Подписки собираются с помощью метода getSubscriptions.
   * Если в результате выполнения запроса будет объект _query:{after:ID},
   * то необходимо снова выполнить getSubscriptions с параметром after:ID
   */
  mySubreddits = async () => {
    // Имя последней подписки в запросе
    let after: string | null = null;
    // Массив reddit-подписок
    const subArray: { id: string; url: string; title: string; over18: boolean }[] = [];
    do {
      // eslint-disable-next-line no-await-in-loop
      const subs = await this.client.getSubscriptions(after !== null ? { after } : undefined);
      subs.forEach((s) => {
        const { over18, title, url, id } = s;
        subArray.push({ over18, title, url, id });
      });
      const { _query: query } = subs as unknown as { _query: { after: string | null } };
      after = query.after;
    } while (after !== null);

    return subArray.map((s) => {
      const { over18, title, url } = s;
      return { id: url.replace('/r/', '').slice(0, -1), over18, title };
    });
  };

  /**
   * Получить новые записи по подписке.
   * Картинки не запрашивать.
   */
  getNewRecords = async (params: {
    channel: string;
    limit: number;
    after?: string;
    before?: string;
  }) => {
    const { limit, channel, after, before } = params;
    const newSubbRecords = await this.client.getNew(channel, {
      limit,
      after: after || undefined,
      before: before || undefined,
      count: 5,
    });
    const { _query } = newSubbRecords as unknown as { _query: { after: string | null } };
    const data = await Promise.allSettled(newSubbRecords.map(parseSubmissionInfo)).then((records) =>
      records.reduce((acc, record) => {
        if (record.status === 'fulfilled') {
          const { value } = record as { value: MediaSummaryPreview };
          acc.push({ ...value });
        }

        return acc;
      }, [] as MediaSummaryPreview[]),
    );
    return { data, after: _query.after, channel };
  };
}
