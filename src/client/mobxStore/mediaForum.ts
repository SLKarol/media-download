import { makeAutoObservable } from 'mobx';

import type { MediaForumProperties } from '@/types/mediaForum';
import type { ListMediaForumsStore } from './listMediaForums';

/**
 * Данные по ЯП-форуму
 */
export class MediaForumStore {
  forum: MediaForumProperties;

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: ListMediaForumsStore, forum: MediaForumProperties) {
    makeAutoObservable(this);
    const { countPages, created, href, name } = forum;
    this.forum = { countPages, created, href, name };
  }
}
