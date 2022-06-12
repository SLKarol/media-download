import { createContext, useContext } from 'react';

import { RedditSubscribeStore } from './redditSubscribes';
import { MediaNewsUIStore } from './mediaNewsUI';
import { MediaNewsContentStore } from './mediaNewsContent';
import { ListMediaForumsStore } from './listMediaForums';

export class RootMediaNewsStore {
  /**
   * Каналы, на которые я подписан
   */
  redditSubscribeStore: RedditSubscribeStore;

  mediaNewsUI: MediaNewsUIStore;

  mediaNewsContentStore: MediaNewsContentStore;

  /**
   * Список форумов
   */
  listForums: ListMediaForumsStore;

  constructor() {
    this.redditSubscribeStore = new RedditSubscribeStore(this);
    this.mediaNewsUI = new MediaNewsUIStore(this);
    this.mediaNewsContentStore = new MediaNewsContentStore(this);
    this.listForums = new ListMediaForumsStore(this);
  }
}

export const RootMediaNewsStoreContext = createContext<RootMediaNewsStore>(
  {} as RootMediaNewsStore,
);

export const useMediaNewsStore = () => {
  return useContext(RootMediaNewsStoreContext);
};
