import { ipcMain, shell, Notification, BrowserWindow } from 'electron';
import type Store from 'electron-store';
import log from 'electron-log';
import type { Telegraf } from 'telegraf';

import { AppSignals } from '@/constants/signals';
import type MenuBuilder from './menu';
import type { Settings } from '@/types/settings';
import type { Reddit } from '@/lib/reddit';
import type { DownloaderMedia } from '@/lib/downloaderMedia';
import { saveSettings, getSettings, changeSaveVideoDir } from './settingsHandlers';
import { getVideoInfo } from './videoHandlers';
import { FileSendTelegram, PropsDownLoadVideo, MediaPreview, MediaAlbum } from '@/types/media';
import {
  sendVideoInTgGroup,
  sendPictureInTgGroup,
  sendMediaGroupToTg,
  sendHolidayNameToTg,
} from './telegramHandlers';
import { getMySubreddit, getRedditNews } from './redditHandlers';
import { downloadCollection, downloadPicture } from './pictureHandlers';
import { StatusFile } from '@/client/mobxStore/fileStatus';
import { getHolydaysToday } from '@/lib/holidays';
import { getImagesCollection, getPreviewImage } from '@/lib/redditUtils';
import { decodeImageUrlTo64 } from '@/lib/net';
import { getYaPlakalNews, getYaplakalTopic, getYaplakalTopicName } from './yaplakalHandlers';
import { FormDataSelectChapters, ParamsAddDownload } from '@/types/downloader';
import { TypeMedia } from '@/constants/media';
import { isCorrectRatio } from '@/lib/images';
import { HOLIDAY_NAME_PATTERN, IMAGE_SIZE_LIMIT } from '@/constants/telegram';

export function setHandlers(props: {
  store: Store<Settings>;
  menuBuilder: MenuBuilder;
  reddit: Reddit;
  telegramBot: Telegraf;
  downloaderMedia: DownloaderMedia;
}): void {
  const { store, menuBuilder, reddit, telegramBot, downloaderMedia } = props;

  // Получить инфо о медиа по ссылке
  ipcMain.handle(AppSignals.GET_VIDEO_INFO, async (event, ...args) => {
    const [url] = args as string[];
    try {
      // Получить инфо о видео
      const { preview, collection, ...info } = await getVideoInfo({ reddit, url });
      event.sender.send(AppSignals.SEND_VIDEO_INFO, info);
      // Для www.reddit.com загрузить превьюху
      const { url: mediaUrl, id, idVideoSource } = info;
      let mediaPreview: MediaPreview;
      // Загрузить превью медиаконтента для reddit'a
      if (idVideoSource === 'www.reddit.com') {
        // Если доступен preview, то загрузить эту картинку
        if (preview) {
          const { images = [] } = preview;
          if (Array.isArray(images) && images.length) {
            mediaPreview = await getPreviewImage({ images, redditUrl: mediaUrl });
          }
        }
        // Если доступна коллекция, то загрузить данные по ней
        if (collection) {
          const collectionWithImages = await getImagesCollection(collection);
          return event.sender.send(AppSignals.SEND_MEDIA_COLLECTION, {
            id,
            collection: collectionWithImages,
          });
        }
      } else {
        // Загрузить превью медиаконтента для остального (не для реддит)
        const decoded = await decodeImageUrlTo64(info.previewImages.src);
        mediaPreview = {
          decoded,
          src: info.previewImages.src,
          height: info.height,
          width: info.width,
        };
      }

      if (mediaPreview) {
        event.sender.send(AppSignals.SEND_MEDIA_PREVIEW, { id, preview: mediaPreview });
      }
    } catch (err) {
      log.error(err);
      event.sender.send(AppSignals.BACKEND_ERROR, err);
    }
    return undefined;
  });

  ipcMain.handle(AppSignals.SETTINGS_SAVE, (_, ...args) => {
    saveSettings({ menuBuilder, reddit, settings: args[0], store });
  });

  ipcMain.handle(AppSignals.OPEN_URL, (_, ...args) => {
    if (args.length && typeof args[0] === 'string') {
      shell.openExternal(args[0]);
    }
  });

  ipcMain.handle(AppSignals.SETTINGS_GET, (event, ...args) => {
    let nameSettings: string | undefined;
    if (Array.isArray(args) && args.length && typeof args[0] === 'string') {
      [nameSettings] = args;
    }
    getSettings({ event, store, nameSettings });
  });

  ipcMain.handle(AppSignals.CHANGE_SAVE_VIDEO_DIR, (event) => {
    changeSaveVideoDir({ event, store });
  });

  ipcMain.handle(AppSignals.DOWNLOAD_MEDIA, ({ sender }, ...args) => {
    const videoInfo: PropsDownLoadVideo = args[0];
    const { idSource, sendVote, idRecord, title, urlAudio, urlVideo } = videoInfo;

    Promise.allSettled([
      downloaderMedia.addDownload({
        eventSender: sender,
        idVideoSource: idSource,
        media: TypeMedia.video,
        title,
        url: urlVideo,
        urlAudio,
      }),
      new Promise((re) => {
        if (idSource === 'www.reddit.com' && sendVote)
          reddit
            .sendVote(idRecord)
            .then(() => re(true))
            .catch(() => re(false));
        else re(false);
      }),
    ]);
  });

  ipcMain.handle(AppSignals.RECORD_VOTE, (_, ...args) => {
    const { idRecord, idSource } = args[0] as { idRecord: string; idSource: string };
    if (idSource === 'www.reddit.com') {
      reddit.sendVote(idRecord).then(() =>
        new Notification({
          title: '',
          body: 'Голос отдан',
          silent: true,
        }).show(),
      );
    }
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_VIDEO, (event, ...args) => {
    const tgGroups = store.get('telegramGropus').split(',');
    const tgAdmin = store.get('telegramAdmin');
    if (tgGroups.length)
      sendVideoInTgGroup({ ...args[0], event, tgGroups, telegramBot, tgAdmin, downloaderMedia });
  });

  ipcMain.handle(AppSignals.REDDIT_RECEIVE_MY_REDDITS, async (event) => {
    try {
      const subscribes = await getMySubreddit({ reddit });
      event.sender.send(AppSignals.REDDIT_RESPONSE_MY_REDDITS, Array.from(subscribes));
    } catch (err) {
      event.sender.send(AppSignals.BACKEND_ERROR, err);
    }
  });

  ipcMain.handle(AppSignals.REDDIT_GET_NEWS, (event, ...args) => {
    const { after, channel } = args[0] as { channel: string; after: string | null };
    const limit = store.get('redditLimitRecords');
    getRedditNews({ channel, limit, reddit, event, after });
  });

  ipcMain.handle(AppSignals.DOWNLOAD_PICTURE, (event, ...args) => {
    const param = args[0] as {
      image: string;
      idRecord: string;
      sendVote: boolean;
      title: string;
      url: string;
      idSource: string;
    };
    const { sendVote, idSource, ...paramImage } = param;

    Promise.allSettled([
      downloadPicture({
        param: paramImage,
        savePath: store.get('defaultSavePath'),
        event,
      }),
      new Promise((re) => {
        if (idSource === 'www.reddit.com' && sendVote)
          reddit.sendVote(paramImage.idRecord).catch(() => re(false));
        else re(false);
      }),
    ]);
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_PICTURE, async (event, ...args) => {
    const tgGroups = store.get('telegramGropus').split(',');
    const tgAdmin = store.get('telegramAdmin');
    if (tgGroups.length) {
      const param = args[0] as {
        image: string;
        idRecord: string;
        sendVote: boolean;
        title: string;
        url: string;
        idSource: string;
      };
      const { idRecord, title, url } = param;
      // Отдать в статистику инфо, что скачивается файл
      event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
        id: idRecord,
        title,
        status: StatusFile.TELEGRAM_SENDING,
        description: '',
      });

      try {
        await sendPictureInTgGroup({ title, url, tgGroups, telegramBot, tgAdmin });
      } catch (e) {
        log.error(e);
      }

      event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
        id: idRecord,
        title,
        status: StatusFile.TELEGRAM_SEND,
        description: '',
      });
    }
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_MEDIA_GROUP, async (event, ...args) => {
    new Notification({
      title: '',
      body: 'Рассылка отправляется, ждите.',
      silent: true,
    }).show();
    const delayMs = store.get('waitMsWhenSendTelegram');

    const [media, holydayName] = args as [media: FileSendTelegram[], holidayMessage: string];

    const telegramGropus = store.get('telegramGropus').split(',');
    const telegramAdmin = store.get('telegramAdmin');
    if (holydayName) {
      const holydayTemplate = store.get('descriptionHoliday');

      await sendHolidayNameToTg({
        telegramGropus,
        telegramBot,
        holidayMessage: holydayTemplate.replace(HOLIDAY_NAME_PATTERN, holydayName),
        delayMs,
      });
    }
    await sendMediaGroupToTg({ telegramGropus, media, telegramBot, telegramAdmin, delayMs });

    new Notification({
      title: '',
      body: 'Рассылка отправлена.',
      silent: true,
    }).show();
  });

  ipcMain.handle(AppSignals.HOLIDAYS_GET, async (event) => {
    const holidays = await getHolydaysToday();
    event.sender.send(AppSignals.HOLIDAYS_RESPONSE, holidays);
  });

  ipcMain.handle(AppSignals.YAPLAKAL_GET_NEWS, (event, ...args) => {
    const [url] = args as string[];
    getYaPlakalNews({ url, event });
  });

  ipcMain.handle(AppSignals.YAPLAKAL_GET_TOPIC, (event, ...args) => {
    const [url] = args as string[];
    getYaplakalTopic({ url, event });
  });

  ipcMain.handle(AppSignals.YAPLAKAL_GET_TOPIC_NAME, (event, ...args) => {
    const [url] = args as string[];
    getYaplakalTopicName({ event, url });
  });

  ipcMain.handle(AppSignals.APP_CHANGE_TITLE, (_, ...args) => {
    const [title = ''] = args as string[];
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.setTitle(title);
    }
  });

  ipcMain.handle(AppSignals.DOWNLOAD_YOUTUBE, ({ sender }, ...args) => {
    const params = args[0] as ParamsAddDownload;
    downloaderMedia.runDownloadYouTube({ ...params, eventSender: sender });
  });

  ipcMain.handle(AppSignals.DOWNLOAD_CANCEL, async (event, ...args) => {
    const [id] = args as string[];
    await downloaderMedia.downloadCancel(id);
    event.sender.send(AppSignals.DOWNLOAD_CANCELLED, id);
  });

  ipcMain.handle(AppSignals.DOWNLOAD_CHAPTERS, ({ sender }, ...args) => {
    const params = args[0] as {
      settings: FormDataSelectChapters;
      id: string;
      title: string;
      permalink: string;
    };
    downloaderMedia.downloadChapters({ ...params, eventSender: sender });
  });

  ipcMain.handle(AppSignals.DOWNLOAD_COLLECTION, ({ sender }, ...args) => {
    // Преобразовать параметр в понятный объект
    const param = args[0] as {
      collection: MediaAlbum;
      idRecord: string;
      sendVote: boolean;
      title: string;
      url: string;
      idSource: string;
    };
    const { sendVote, idSource, idRecord, title, collection } = param;
    // Показать в заголовке статус- скачивается
    sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idRecord,
      title,
      status: StatusFile.LOADING,
      description: title,
    });
    // Скачать альбом и если нужно, то проголосовать за ресурс
    Promise.allSettled([
      downloadCollection({
        collection,
        title,
        idSource,
        savePath: store.get('defaultSavePath'),
      }).finally(() =>
        sender.send(AppSignals.JOURNAL_ADD_RECORD, {
          id: idRecord,
          title,
          status: StatusFile.LOADED,
          description: title,
        }),
      ),
      new Promise((re) => {
        if (idSource === 'www.reddit.com' && sendVote)
          reddit.sendVote(idRecord).catch(() => re(false));
        else re(false);
      }),
    ]);
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_COLLECTION, async ({ sender }, ...args) => {
    const telegramGropus = store.get('telegramGropus').split(',');
    const telegramAdmin = store.get('telegramAdmin');
    const delayMs = store.get('waitMsWhenSendTelegram');
    // Преобразовать параметр в понятный объект
    const param = args[0] as {
      collection: MediaAlbum;
      idRecord: string;
      title: string;
      idSource: string;
    };
    const { idSource, idRecord, title, collection } = param;

    if (!telegramGropus.length || idSource !== 'www.reddit.com') return undefined;

    // Отдать в статистику инфо, что отправляется файл
    sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idRecord,
      title,
      status: StatusFile.TELEGRAM_SENDING,
      description: '',
    });

    // Преобразовать коллекцию в формат отправки альбомов в телеграм
    const media: FileSendTelegram[] = Object.values(collection).map(
      ({ id, url, height, width, data }) => ({
        id,
        title: '',
        url,
        unSupportTelegram: isCorrectRatio(width, height) && data.length < IMAGE_SIZE_LIMIT,
      }),
    );

    await sendMediaGroupToTg({
      telegramGropus,
      media,
      telegramBot,
      telegramAdmin,
      caption: title,
      delayMs,
    });

    return sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idRecord,
      title,
      status: StatusFile.TELEGRAM_SEND,
      description: '',
    });
  });
}
