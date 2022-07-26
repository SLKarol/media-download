/* eslint-disable no-unused-vars */
import { IpcRendererEvent, IpcRenderer } from 'electron';

import type { StatusFile } from '@client/mobxStore/fileStatus';
import type { Subscribe } from '@client/mobxStore/redditSubscribes';
import { TypeMedia } from '@/constants/media';
import { MediaSummary, PropsDownLoadVideo, MediaPreview, MediaSummaryPreview } from './media';
import { Settings } from './settings';
import { YaPlakalForumProperties, HasPrevNextPage } from './yplakal';
import { DownloadValues, FormDataSelectChapters } from './downloader';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        /**
         * Запросить инфу о видео
         */
        getInfo(url: string): Promise<string>;
        /**
         * Пришла ошибка из main
         */
        onBackendError: (callback: (_event: IpcRendererEvent, error: Error) => void) => IpcRenderer;
        /**
         * Получение из бэкенда инфы о видео
         */
        receiveVideoInfo: (
          callback: (_event: IpcRendererEvent, videoInfo: MediaSummary) => void,
        ) => IpcRenderer;

        /**
         * Получение из бэкенда превьюхи видео
         */
        receiveMediaPreview: (
          callback: (
            _event: IpcRendererEvent,
            params: { id: string; preview: MediaPreview },
          ) => void,
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
              status: StatusFile;
              description?: string;
              idMedia: string;
              disableDelete?: boolean;
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
          idVideoSource: string;
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
        getRedditNews(params: { channel: string; after: string | null }): void;

        /**
         * Получение новых записей из reddit-канала
         */
        redditResponseNews: (
          callback: (
            _event: IpcRendererEvent,
            data: { records: MediaSummaryPreview[]; after: string | null; channel: string },
          ) => void,
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

        /**
         * Получить постер для медиа из группы
         */
        receiveMediaGroupPreview: (
          callback: (
            _event: IpcRendererEvent,
            params: { id: string; preview: MediaPreview },
          ) => void,
        ) => IpcRenderer;

        /**
         * Получить новые записи из форума YaPlakal
         */
        getYaplakalNews(url: string): void;

        /**
         * Удалить обработчики ЯПновости
         */
        removeListenersYaplakalnews(): void;
        /**
         * Получение списка форумов из ЯП
         */
        yaplakalResponseNews: (
          callback: (_event: IpcRendererEvent, list: YaPlakalForumProperties[]) => void,
        ) => IpcRenderer;

        /**
         * Получить ЯП тему
         */
        getYaplakalTopic(url: string): void;

        /**
         * Ответ: Топик ЯП
         */
        yaplakalResponseTopic: (
          callback: (
            _event: IpcRendererEvent,
            data: { media: Partial<MediaSummaryPreview>[]; pages: HasPrevNextPage },
          ) => void,
        ) => IpcRenderer;

        yaplakalResponseTopicPreview: (
          callback: (
            _event: IpcRendererEvent,
            params: { id: string; preview: Partial<MediaPreview> },
          ) => void,
        ) => IpcRenderer;

        /**
         * Взять название топика
         */
        getYaplakalTopicName(topic: string): void;

        yaplakalResponseTopicName: (
          callback: (_event: IpcRendererEvent, data: { href: string; name: string }) => void,
        ) => IpcRenderer;

        /**
         * Изменить заголовок у приложения
         */
        appChangeTitle(title: string): void;

        /**
         * Скачать ютуб-медиа
         */
        downloadYoutube(param: {
          media: TypeMedia;
          subtitle?: string;
          subtitleType?: string;
          subtitleLanguageCode?: string;
          permalink: string;
          title: string;
          idVideoSource: string;
        }): void;

        /**
         * Прогресс скачивания
         */
        downloadProgress: (
          callback: (
            _event: IpcRendererEvent,
            data: {
              /**
               * ID загрузки
               */
              id: string;
              progress: {
                audio?: DownloadValues;
                video?: DownloadValues;
                subtitle?: DownloadValues;
                picture?: DownloadValues;
              };
            },
          ) => void,
        ) => IpcRenderer;

        /**
         * Скачивание завершено
         */
        downloadFinish: (
          callback: (
            _event: IpcRendererEvent,
            data: {
              /**
               * ID загрузки
               */
              id: string;
            },
          ) => void,
        ) => IpcRenderer;

        /**
         * Ошибка при скачивании
         */
        downloadError: (
          callback: (
            _event: IpcRendererEvent,
            data: {
              /**
               * ID загрузки
               */
              id: string;
              error: Error;
            },
          ) => void,
        ) => IpcRenderer;

        /**
         * Отменить загрузку медиа
         */
        downloadCancel(id: string): void;

        /**
         * Сигнал о том, что загрузка отменена
         */
        downloadCancelled: (
          callback: (_event: IpcRendererEvent, id: string) => void,
        ) => IpcRenderer;

        /**
         * Скачать частями
         */
        downloadChapters(params: {
          settings: FormDataSelectChapters;
          id: string;
          title: string;
          permalink: string;
        }): void;
      };
    };
  }
}

export {};
