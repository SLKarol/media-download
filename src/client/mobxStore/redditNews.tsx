import { createContext, useContext } from 'react';

import { RedditSubscribeStore } from './redditSubscribes';
import { RedditNewsUI } from './redditNewsUI';
import { RedditNewsContentStore } from './redditNewsContent';

export class RootRedditNewsStore {
  redditSubscribeStore: RedditSubscribeStore;

  redditNewsUI: RedditNewsUI;

  redditNewsContentStore: RedditNewsContentStore;

  constructor() {
    this.redditSubscribeStore = new RedditSubscribeStore(this);
    this.redditNewsUI = new RedditNewsUI(this);
    this.redditNewsContentStore = new RedditNewsContentStore(this);
  }
}

export const RootRedditNewsStoreContext = createContext<RootRedditNewsStore>(
  {} as RootRedditNewsStore,
);

export const useRedditNewsStore = () => {
  return useContext(RootRedditNewsStoreContext);
};
