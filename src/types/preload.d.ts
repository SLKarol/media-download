/* eslint-disable no-unused-vars */
import { IpcRendererEvent, IpcRenderer } from 'electron';

import type { StatusJournal } from '@client/mobxStore/journal';
import type { Subscribe } from '@client/mobxStore/redditSubscribes';
import { MediaSummary, PropsDownLoadVideo } from './media';
import { Settings } from './settings';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        /**
         * Запросить инфу о видео
         */
        getInfo(url: string): Promise<string>;
        onBackendBusy: (callback: (_event: IpcRendererEvent, busy: boolean) => void) => IpcRenderer;
        receiveVideoInfo: (
          callback: (_event: IpcRendererEvent, videoInfo: MediaSummary) => void,
        ) => IpcRenderer;
        onSelectMenu: (callback: (_event: IpcRendererEvent, value: string) => void) => IpcRenderer;
        /**
         * Открыть ссылку в броузере
         */
        openUrl(url: string): Promise<void>;
        // settings
        /**
         * Сохранить настройки
         */
        settingsSave(settings: Settings): Promise<void>;
        /**
         * Получение настроек
         */
        receiveSettings: (
          callback: (_event: IpcRendererEvent, settings: Settings) => void,
        ) => IpcRenderer;
        /**
         * Запросить настройки
         */
        getSettings(settingName?: string): void;
        /**
         * Изменить каталог сохранения видео
         */
        changeDefaultVideoSaveDir(): Promise<void>;
        /**
         * Скопировать текст в буфер обмена
         */
        copyTextToClipBoard(value: string): void;
        /**
         * Скачать видео
         */
        downloadVideo(props: PropsDownLoadVideo): void;
        /**
         * Проголосовать за запись
         */
        voteRecord(props: { idRecord: string; idSource: string });

        /**
         * Добавить запись в журнал
         */
        addJournalRecord: (
          callback: (
            _event: IpcRendererEvent,
            props: {
              id: string;
              title?: string;
              status: StatusJournal;
              description?: string;
            },
          ) => void,
        ) => IpcRenderer;

        /**
         * Отписка от обработчиков всех сообщений
         */
        removeAllListeners(): void;

        /**
         * Отправить одно видео в телеграмм-группу(ы)
         */
        sendVideoToTg(props: {
          id: string;
          urlVideo: string;
          urlAudio?: string;
          title: string;
          height?: number;
          width?: number;
          thumb: string;
          downloadedFileName: string;
        }): void;

        /**
         * Получить список моих лент
         */
        getMySubreddit(): void;
        /**
         * Получение списка моих лент
         */
        redditResponseMyReddits: (
          callback: (_event: IpcRendererEvent, subscribes: Subscribe[]) => void,
        ) => IpcRenderer;
        /**
         * Удалить обработчики новостей
         */
        removeListenerResponseMyReddits(): void;
        /**
         * Получить новые записи из reddit-канала
         */
        getRedditNews(channel: string): void;

        /**
         * Получение новых записей из reddit-канала
         */
        redditResponseNews: (
          callback: (_event: IpcRendererEvent, records: MediaSummary[]) => void,
        ) => IpcRenderer;

        /**
         * Скачать картинку
         */
        downloadPicture(param: {
          image: string;
          idRecord: string;
          sendVote: boolean;
          title: string;
          url: string;
          idSource: string;
        }): void;

        /**
         * Отправить картинку в телеграм
         */
        sendPictureToTg(param: { id: string; title: string; url: string; image: string });

        /**
         * Отправить в телеграм медиа
         */
        sendMediaGroupToTg(
          media: {
            id: string;
            url: string;
            title: string;
            unSupportTelegram: boolean;
          }[],
          helloMessage?: string,
        ): void;

        /**
         * Получить список праздников
         */
        holidaysResponse: (
          callback: (_event: IpcRendererEvent, holidays: string[]) => void,
        ) => IpcRenderer;

        /**
         * Запросить список праздников
         */
        holidaysGet(): void;
      };
    };
  }
}

export {};
