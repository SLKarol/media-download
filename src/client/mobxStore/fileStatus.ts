import { makeObservable, computed, action, observable } from 'mobx';

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

export interface IJournalRecord {
  status: StatusFile;

  description?: string;

  lastModified: string;
}

export interface JournalUI {
  id: string;
  title: string;
  lastModified: string;
  status: StatusFile;
  events: IJournalRecord[];
}

export class FileStatusStore {
  journal: Map<string, { title: string; events: IJournalRecord[] }> = new Map();

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeObservable(
      this,
      {
        journal: observable,
        listingJournal: computed,
        addStatusRecord: action,
      },
      { autoBind: true },
    );
  }

  /**
   * Добавить запись в журнал
   */
  addStatusRecord = (props: {
    id: string;
    title?: string;
    status: StatusFile;
    description?: string;
  }): void => {
    const { id, status, title = '', description = '' } = props;

    const jl = this.journal.get(id);
    if (jl) {
      jl.events.push({ lastModified: new Date().toISOString(), status, description });
      // Если файл скачали, записать в другом сторе
      if (status === StatusFile.LOADED) {
        this.rootStore.videoInfo.writeFullName(description);
      }

      return undefined;
    }
    this.journal.set(id, {
      title,
      events: [{ lastModified: new Date().toISOString(), status, description }],
    });
    return undefined;
  };

  get listingJournal() {
    const re: JournalUI[] = [];
    const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    this.journal.forEach((journal, id) => {
      const { title, events } = journal;
      const lastRecord = events[events.length - 1];
      re.push({
        id,
        title,
        lastModified: lastRecord.lastModified,
        status: lastRecord.status,
        events: events.map((e) => ({
          lastModified: dateTimeFormat.format(new Date(e.lastModified)),
          status: e.status,
          description: e.description,
        })),
      });
    });

    re.sort((a, b) => {
      if (a.lastModified < b.lastModified) return 1;
      if (a.lastModified > b.lastModified) return -1;
      return 0;
    });

    return re;
  }
}
