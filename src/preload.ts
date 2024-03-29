import { contextBridge, ipcRenderer, IpcRendererEvent, clipboard } from 'electron';

import { AppSignals } from './constants/signals';
import { FormDataSelectChapters } from './types/downloader';
import type { MediaAlbum, PropsDownLoadVideo } from './types/media';
import { Settings } from './types/settings';

/**
 * Имя обработчика и соответствующее ему сообщение.
 * Идея здесь такова, что на сообщение сопоставляется обработчик,
 * который можно будет вызвать из любого места UI-программы
 */
const EVENTS_HANDLERS = {
  onSelectMenu: AppSignals.MENU_SELECT,
  receiveVideoInfo: AppSignals.SEND_VIDEO_INFO,
  receiveMediaPreview: AppSignals.SEND_MEDIA_PREVIEW,
  receiveMediaGroupPreview: AppSignals.SEND_MEDIA_GROUP_PREVIEW,
  getMediaCollection: AppSignals.SEND_MEDIA_COLLECTION,
  getMediaGroupCollection: AppSignals.SEND_MEDIA_GROUP_COLLECTION,
  onBackendError: AppSignals.BACKEND_ERROR,
  receiveSettings: AppSignals.SETTINGS_SEND,
  addJournalRecord: AppSignals.JOURNAL_ADD_RECORD,
  redditResponseMyReddits: AppSignals.REDDIT_RESPONSE_MY_REDDITS,
  redditResponseNews: AppSignals.REDDIT_RESPONSE_NEWS,
  holidaysResponse: AppSignals.HOLIDAYS_RESPONSE,
  yaplakalResponseNews: AppSignals.YAPLAKAL_RESPONSE_NEWS,
  yaplakalResponseTopic: AppSignals.YAPLAKAL_RESPONSE_TOPIC,
  yaplakalResponseTopicPreview: AppSignals.YAPLAKAL_RESPONSE_TOPIC_PREVIEW,
  yaplakalResponseTopicName: AppSignals.YAPLAKAL_RESPONSE_TOPIC_NAME,
  downloadError: AppSignals.DOWNLOAD_ERROR,
  downloadFinish: AppSignals.DOWNLOAD_FINISH,
  downloadProgress: AppSignals.DOWNLOAD_PROGRESS,
  downloadCancelled: AppSignals.DOWNLOAD_CANCELLED,
};

/**
 * Обработчики сообщений электрона.
 * В эту переменную собраны для того, чтобы было удобно отписываться от всех обработчиков.
 */
const handlersOfCallBack = (
  Object.keys(EVENTS_HANDLERS) as Array<keyof typeof EVENTS_HANDLERS>
).map((key) => ({
  // eslint-disable-next-line no-unused-vars
  [key]: (callback: (event: IpcRendererEvent, args: unknown[]) => void) =>
    ipcRenderer.on(EVENTS_HANDLERS[key], callback),
}));

contextBridge.exposeInMainWorld('electron', {
  // Здесь задаются функции, которые вызывают сообщения
  ipcRenderer: Object.assign(
    {
      getInfo: (url: string) => ipcRenderer.invoke(AppSignals.GET_VIDEO_INFO, url),
      openUrl: (url: string) => ipcRenderer.invoke(AppSignals.OPEN_URL, url),
      // settings
      settingsSave: (settings: Settings) => ipcRenderer.invoke(AppSignals.SETTINGS_SAVE, settings),
      getSettings: (settingName?: string) =>
        ipcRenderer.invoke(AppSignals.SETTINGS_GET, settingName),
      changeDefaultVideoSaveDir: () => ipcRenderer.invoke(AppSignals.CHANGE_SAVE_VIDEO_DIR),
      copyTextToClipBoard: (text: string) => clipboard.writeText(text),
      // video
      downloadVideo: (props: PropsDownLoadVideo) =>
        ipcRenderer.invoke(AppSignals.DOWNLOAD_MEDIA, props),
      voteRecord: (props: { idRecord: string; idSource: string }) =>
        ipcRenderer.invoke(AppSignals.RECORD_VOTE, props),

      // Скачать альбом
      downloadCollection: (params: {
        collection: MediaAlbum;
        idRecord: string;
        sendVote: boolean;
        title: string;
        url: string;
        idSource: string;
      }) => ipcRenderer.invoke(AppSignals.DOWNLOAD_COLLECTION, params),

      /**
       * Отписка от всех сообщений
       */
      removeAllListeners: () => {
        Object.keys(EVENTS_HANDLERS).forEach((key: keyof typeof EVENTS_HANDLERS) =>
          ipcRenderer.removeAllListeners(EVENTS_HANDLERS[key]),
        );
      },

      /**
       * Отправить видео в телеграм
       */
      sendVideoToTg: (props: {
        id: string;
        urlVideo: string;
        urlAudio?: string;
        title: string;
        height?: number;
        width?: number;
        thumb: string;
        downloadedFileName: string;
        idVideoSource: string;
      }) => ipcRenderer.invoke(AppSignals.TELEGRAM_SEND_VIDEO, props),

      getMySubreddit: () => ipcRenderer.invoke(AppSignals.REDDIT_RECEIVE_MY_REDDITS),
      /**
       * Отписаться от событий reddit-новостей
       */
      removeListenerResponseMyReddits: () => {
        ipcRenderer.removeAllListeners(AppSignals.REDDIT_RESPONSE_MY_REDDITS);
        ipcRenderer.removeAllListeners(AppSignals.REDDIT_RESPONSE_NEWS);
        ipcRenderer.removeAllListeners(AppSignals.SEND_MEDIA_GROUP_PREVIEW);
      },
      getRedditNews: (params: { channel: string; after: string | null }) =>
        ipcRenderer.invoke(AppSignals.REDDIT_GET_NEWS, params),
      /**
       * Скачать картинку
       */
      downloadPicture: (param: {
        image: string;
        idRecord: string;
        sendVote: boolean;
        title: string;
        url: string;
        idSource: string;
      }) => ipcRenderer.invoke(AppSignals.DOWNLOAD_PICTURE, param),

      sendPictureToTg: (media: { id: string; title: string; url: string; image: string }) =>
        ipcRenderer.invoke(AppSignals.TELEGRAM_SEND_PICTURE, media),

      sendCollectionToTelegram: (param: {
        collection: MediaAlbum;
        idRecord: string;
        title: string;
        idSource: string;
      }) => ipcRenderer.invoke(AppSignals.TELEGRAM_SEND_COLLECTION, param),

      sendMediaGroupToTg: (
        medias: {
          id: string;
          url: string;
          title: string;
          unSupportTelegram: boolean;
        }[],
        helloMessage: string,
      ) => ipcRenderer.invoke(AppSignals.TELEGRAM_SEND_MEDIA_GROUP, medias, helloMessage),

      /**
       * Список праздников
       */
      holidaysGet: () => ipcRenderer.invoke(AppSignals.HOLIDAYS_GET),

      /**
       * Получить новые записи из YaPlakal
       */
      getYaplakalNews: (url: string) => ipcRenderer.invoke(AppSignals.YAPLAKAL_GET_NEWS, url),

      /**
       * Отписаться от событий YaPlakal-новостей
       */
      removeListenersYaplakalnews: () => {
        ipcRenderer.removeAllListeners(AppSignals.YAPLAKAL_RESPONSE_NEWS);
        ipcRenderer.removeAllListeners(AppSignals.YAPLAKAL_RESPONSE_TOPIC);
        ipcRenderer.removeAllListeners(AppSignals.YAPLAKAL_RESPONSE_TOPIC_PREVIEW);
        ipcRenderer.removeAllListeners(AppSignals.YAPLAKAL_RESPONSE_TOPIC_NAME);
      },

      /**
       * Получить ЯП тему
       */
      getYaplakalTopic: (url: string) => ipcRenderer.invoke(AppSignals.YAPLAKAL_GET_TOPIC, url),

      getYaplakalTopicName: (url: string) =>
        ipcRenderer.invoke(AppSignals.YAPLAKAL_GET_TOPIC_NAME, url),

      appChangeTitle: (title: string) => ipcRenderer.invoke(AppSignals.APP_CHANGE_TITLE, title),

      downloadYoutube: (props: {
        media: string;
        subtitle?: string;
        subtitleType?: string;
        subtitleLanguageCode?: string;
        permalink: string;
        title: string;
      }) => ipcRenderer.invoke(AppSignals.DOWNLOAD_YOUTUBE, props),

      downloadCancel: (id: string) => ipcRenderer.invoke(AppSignals.DOWNLOAD_CANCEL, id),

      downloadChapters: (params: { settings: FormDataSelectChapters; id: string }) =>
        ipcRenderer.invoke(AppSignals.DOWNLOAD_CHAPTERS, params),
    },
    ...handlersOfCallBack,
  ),
});
