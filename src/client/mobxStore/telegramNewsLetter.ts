import { makeAutoObservable } from 'mobx';

import type { RootStore } from './root';
import { MediaSummary } from '@/types/media';

// todo: Delete
export class TelegramNewsLetterStore {
  /**
   * Записи для отправки в телеграм
   */
  private recordsToNews: Map<string, MediaSummary> = new Map();

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  /**
   * Количество выбранного материала
   */
  get count() {
    return this.recordsToNews.size;
  }

  clear = () => {
    this.recordsToNews.clear();
  };

  delete = (id: string) => {
    this.recordsToNews.delete(id);
  };
}
