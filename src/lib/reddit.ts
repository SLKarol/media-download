import Snoowrap from 'snoowrap';
import type { Submission } from 'snoowrap';
import type { ImagePreview, Media } from 'snoowrap/dist/objects/Submission';
import type Store from 'electron-store';

import { VIDEO_SOURCES } from '@/constants/videoSrc';
import { VideoParts, MediaPreview, MediaSummary } from '@/types/media';
import type { Settings } from '@/types/settings';
import { decodeImageUrlTo64 } from './images';
import { downloadRedGifsInfo } from './redgifs';

const REGEXP_GIF_REDDIT = /https:\/\/i.redd.it\/\w+(.gif)?/;

interface ExtendSubmission extends Submission {
  crosspost_parent_list: [{ secure_media: Media }];
}

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
  getInfo = (props: { urlReddit: string }): Promise<MediaSummary> => {
    const { urlReddit } = props;
    const urlId = this.getSubmissionId(urlReddit);

    // Получить данные о записи реддита
    const subRecord = this.client.getSubmission(urlId);
    // Поскольку библиотека snoowrap очень странно работает с промисами,
    // (так что TS ругается на ошибки),
    // То получение данных о видео будет идти через цепочки .then
    return subRecord
      .fetch()
      .then((submission) => this.getSubmissionInfo(submission))
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
   * Реддит-заметка содержит видео?
   */
  // eslint-disable-next-line class-methods-use-this
  private checkHaveVideo = (url: string, media: Media) => {
    if (url.match(/.(gifv)$/i)) return true;
    if (!media) return false;
    const { type = '' } = media;
    if (type === 'redgifs.com') return true;
    const fallbackUrl = media?.reddit_video?.fallback_url;
    if (fallbackUrl) {
      const urlVideo = fallbackUrl.split('?')[0];
      const fileName = urlVideo.substring(urlVideo.lastIndexOf('/') + 1);
      if (fileName.startsWith('DASH_')) {
        return true;
      }
    }
    return false;
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
   * Получить превью-картинки
   */
  private async getPreviewImages(preview: {
    enabled: boolean;
    images: ImagePreview[];
    redditUrl: string;
  }): Promise<MediaPreview> {
    const re: MediaPreview = { decoded: '', src: '' };
    const prImages = preview && 'images' in preview ? preview.images : [];
    if (prImages.length === 0) {
      return re;
    }
    const previewData = prImages[0];
    const loadResponsePreview = this.store.get('loadResponsePreview');
    const { redditUrl } = preview;
    // Загрузить главную картинку
    const { height, url, width } = previewData.source;
    if (REGEXP_GIF_REDDIT.test(redditUrl)) {
      re.decoded = await decodeImageUrlTo64(redditUrl);
      re.src = url;
      re.height = height;
      re.width = width;
      return re;
    }
    re.decoded = await decodeImageUrlTo64(previewData.source.url);
    re.src = url;
    re.height = height;
    re.width = width;

    if (!loadResponsePreview) {
      return re;
    }
    // Загрузить адаптивные картинки
    if ('resolutions' in previewData && previewData.resolutions.length) {
      const promisesDecode: Array<Promise<string>> = [];

      previewData.resolutions.forEach(async (r) => {
        promisesDecode.push(decodeImageUrlTo64(r.url));
      });

      const decodeImages = await Promise.all(promisesDecode);
      re.resolutions = previewData.resolutions.map((r, i) => ({
        decoded: decodeImages[i],
        width: r.width,
        height: r.height,
      }));
    }
    return re;
  }

  /**
   * @param {Object} record Запись из reddit
   * @param {string} record.url Ссылка на видео
   * @param {string} record.title Название видео
   * @param {Object} record.media Скомбинированная инфа о видео
   * @return {Promise} videoRecords
   */
  // eslint-disable-next-line class-methods-use-this
  private getVideoUrl = async (record: Partial<Submission>): Promise<VideoParts | null> => {
    const { url = '', media } = record;
    // Это gifv?
    if (url.match(/.(gifv)$/i)) {
      return { urlVideo: url.replace('.gifv', '.mp4') };
    }
    // В остальных случаях должен быть объект media
    if (!media) {
      return null;
    }
    // Это обычное видео?
    const fallbackUrl = media?.reddit_video?.fallback_url;

    if (fallbackUrl) {
      const urlVideo = fallbackUrl.split('?')[0];
      const fileName = urlVideo.substring(urlVideo.lastIndexOf('/') + 1);
      if (!fileName.startsWith('DASH_')) {
        return null;
      }
      const urlAudio = urlVideo.replace(fileName, 'DASH_audio.mp4');
      return { urlVideo, urlAudio };
    }
    return null;
  };

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

  mySubreddits = async () => {
    const mySubreddits = await this.client.getSubscriptions();

    return mySubreddits.map((s) => {
      const { over18, title, url } = s;
      return { id: url.replace('/r/', '').slice(0, -1), over18, title };
    });
  };

  getNewRecords = async (name: string) => {
    const newSubbRecords = await this.client.getNew(name, { limit: 50 });
    return Promise.allSettled(newSubbRecords.map(this.getSubmissionInfo)).then((records) =>
      records.reduce((acc, record) => {
        if (record.status === 'fulfilled') {
          const { value } = record as { value: MediaSummary };
          acc.push({ ...value });
        }

        return acc;
      }, [] as MediaSummary[]),
    );
  };

  /**
   * Submission разбирает для программы
   */
  private getSubmissionInfo = async (submission: Submission) => {
    return this.parseSubmissionInfo(submission).then(
      ([haveVideo, previewImages, videoParts, partialRe]) => {
        return { haveVideo, previewImages, videoParts, ...partialRe };
      },
    );
  };

  private parseSubmissionInfo = async (
    submission: Submission,
  ): Promise<[boolean, MediaPreview, VideoParts, MediaSummary]> => {
    // Получить основное инфо
    const {
      id,
      title,
      preview,
      subreddit: { display_name: subRedditDisplayName },
      over_18: over18,
      secure_media: media,
      crosspost_parent_list: crosspostParentList,
      url,
      permalink,
    } = submission as ExtendSubmission;
    // media может быть не своё, а из репоста
    let videoMedia: Media | null = media;
    if (!videoMedia && Array.isArray(crosspostParentList) && crosspostParentList.length) {
      videoMedia = crosspostParentList[0].secure_media;
    }

    // Если это видео из redgifs.com, то нужно сделать другую обработку
    if (videoMedia && videoMedia.type === 'redgifs.com') {
      return Promise.all([null, null, null, downloadRedGifsInfo(url)]);
    }

    let height: number;
    let width: number;
    let dimensionPropName: 'reddit_video' | 'oembed';

    if (videoMedia && 'reddit_video' in videoMedia) {
      dimensionPropName = 'reddit_video';
    }
    if (videoMedia && 'oembed' in videoMedia) {
      dimensionPropName = 'oembed';
    }
    if (dimensionPropName) {
      width = (videoMedia[dimensionPropName] as { width: number }).width;
      height = videoMedia[dimensionPropName].height;
    }

    return Promise.all([
      // Запросить: имеется ли видео
      this.checkHaveVideo(url, videoMedia),
      // Запросить: предпросмотр видео
      // this.getPreviewImages(preview, url),
      this.getPreviewImages({ ...preview, redditUrl: url }),
      // Запросить: видеоссылки
      this.getVideoUrl({ url, media: videoMedia }),
      {
        id,
        title,
        subReddit: subRedditDisplayName,
        over18,
        height,
        width,
        idVideoSource: 'www.reddit.com',
        permalink,
        url,
      } as MediaSummary,
    ]);
  };
}
