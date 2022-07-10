import { makeAutoObservable } from 'mobx';

import { DownloadProgress, DownloadValues } from '@/types/downloader';
import type { RootStore } from './root';

export enum StatusFile {
  // eslint-disable-next-line no-unused-vars
  LOADING = 'загружается',
  /**
   * Файл загружен
   */
  // eslint-disable-next-line no-unused-vars
  LOADED = 'загружен',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'ошибка',
  /**
   * Отправляется в телеграм
   */
  // eslint-disable-next-line no-unused-vars
  TELEGRAM_SENDING = 'telegram-sending',
  /**
   * Отправлено в телеграм
   */
  // eslint-disable-next-line no-unused-vars
  TELEGRAM_SEND = 'telegram-send',
}

/**
 * Запись в журнале по времени.
 * ID это dateTimeFormat
 */
export interface JournalTime {
  /**
   * В каком состоянии файл
   */
  status: StatusFile;

  /**
   * Описание статуса (например: Под каким именем файл загружен)
   */
  description?: string;
}

/**
 * Журнал времени для вывода на UI
 */
export interface JournalTimeUI extends JournalTime {
  lastModified: string;
}

/**
 * В каком виде отдавать запись в журнале на UI
 */
export interface JournalUI {
  id: string;
  title: string;
  lastModified: string;
  status: StatusFile;
  events: JournalTimeUI[];
}
export interface DownloadLogs extends DownloadProgress {
  id: string;
  title: string;
}

/**
 * Свойства журнала медиа-ресурса
 */
interface MediaJournalProps extends DownloadProgress {
  /**
   * Название медиа
   */
  title: string;

  /**
   * Статистика по времени. Ключ это dateTimeFormat
   */
  timeLogs: Map<string, JournalTime>;

  /**
   * ID медиа-ресурса
   */
  idMedia: string;
}

/**
 * Запись в журнале о работе с медиа
 */
interface MediaJournal {
  /**
   * ID в журнале
   */
  [I: string]: MediaJournalProps;
}

export class FileStatusStore {
  journal: MediaJournal = {};

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  /**
   * Добавить запись статуса загрузки в журнал
   */
  addStatusRecord = (params: {
    id: string;
    title?: string;
    status: StatusFile;
    description?: string;
    idMedia: string;
  }): void => {
    const { id, idMedia, status, title = '', description = '' } = params;
    // Если запись найдена, то записать свойства
    if (id in this.journal) {
      this.journal[id].timeLogs.set(new Date().toISOString(), { status, description });
    } else {
      // Если запись не найдена, то добавить оную
      this.journal[id] = {
        idMedia,
        title,
        timeLogs: new Map([[new Date().toISOString(), { status, description }]]),
      };
    }
  };

  get listingJournal() {
    const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return Object.keys(this.journal).reduce((acc, key) => {
      const { timeLogs, title } = this.journal[key];
      const events: JournalTimeUI[] = [];
      timeLogs.forEach(({ status, description }, dt) => {
        events.push({ lastModified: dateTimeFormat.format(new Date(dt)), status, description });
      });
      const { lastModified, status } = events[events.length - 1];
      acc.push({ id: key, title, lastModified, status, events });
      return acc;
    }, [] as JournalUI[]);
  }

  /**
   * Ответ на вопрос: Сейчас идёт загрузка?
   */
  get nowDownloading() {
    return this.listingJournal.some(
      (l) => l.status === StatusFile.LOADING || l.status === StatusFile.TELEGRAM_SENDING,
    );
  }

  /**
   * Записывает прогресс загрузки
   */
  progressDownloading = (params: {
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
  }) => {
    if (!this.journal[params.id]) return undefined;
    const journal = this.journal[params.id];
    Object.assign(journal, params.progress);
    return undefined;
  };

  /**
   * Записать тот факт, что загрузка завершена
   */
  completeDownload = (params: { id: string }) => {
    if (!this.journal[params.id]) return undefined;
    this.journal[params.id].timeLogs.set(new Date().toISOString(), {
      status: StatusFile.LOADED,
    });
    return undefined;
  };

  downloadFailed = (params: { id: string; error: Error }) => {
    if (!this.journal[params.id]) return undefined;
    this.journal[params.id].timeLogs.set(new Date().toISOString(), {
      status: StatusFile.ERROR,
      description: JSON.stringify(params.error),
    });
    return undefined;
  };

  /**
   * Для вывода графика загрузки
   */
  get downloadLog() {
    return Object.keys(this.journal).reduce((acc, key) => {
      const { title, timeLogs, audio, picture, subtitle, video } = this.journal[key];
      const timeValues = Array.from(timeLogs.values());
      if (timeValues[timeValues.length - 1].status === StatusFile.LOADING) {
        acc.push({ id: key, audio, picture, subtitle, video, title });
        return acc;
      }
      return acc;
    }, [] as DownloadLogs[]);
  }

  /**
   * Отменить загрузку
   */
  downloadCancelled = (id: string) => {
    delete this.journal[id];
  };
}
