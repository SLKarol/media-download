import { makeAutoObservable } from 'mobx';

import type { RootMediaNewsStore } from './rootMediaNews';
import { MediaForumStore } from './mediaForum';
import type { MediaForumProperties } from '@/types/mediaForum';

/**
 * Список ЯП-форумов
 */
export class ListMediaForumsStore {
  listForums: Map<string, MediaForumStore> = new Map();

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStrore: RootMediaNewsStore) {
    makeAutoObservable(this);
  }

  /**
   * Очистить список
   */
  clear = () => {
    this.listForums.clear();
  };

  /**
   * Загрузить список форумов
   */
  loadForums = (list: MediaForumProperties[]) => {
    list.forEach((item) => {
      this.listForums.set(item.href, new MediaForumStore(this, { ...item }));
    });
  };

  get arrayForums() {
    const re: MediaForumProperties[] = [];
    this.listForums.forEach((yf) => re.push({ ...yf.forum }));
    return re;
  }
}
