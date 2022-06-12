/* eslint-disable max-classes-per-file */
import { makeAutoObservable } from 'mobx';

import type { RootMediaNewsStore } from './rootMediaNews';

export interface Subscribe {
  id: string;
  over18: boolean;
  title: string;
}

/**
 * Подписка на реддит
 */
class RedditSubscribe {
  /**
   * Часть URL'a, указывающая на канал
   */
  id: string;

  over18: boolean;

  title: string;

  /**
   * Родительский стор
   */
  store: RedditSubscribeStore;

  constructor(store: RedditSubscribeStore, subscribe: Subscribe) {
    makeAutoObservable(
      this,
      {
        id: false,
        store: false,
        over18: false,
        title: false,
      },
      { autoBind: true },
    );
    this.store = store;
    const { id, over18, title } = subscribe;
    this.id = id;
    this.over18 = over18;
    this.title = title;
  }
}

export class RedditSubscribeStore {
  subscribes: RedditSubscribe[] = [];

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootMediaNewsStore) {
    makeAutoObservable(this);
  }

  loadSubscribes = (subscribes: Subscribe[]) => {
    this.subscribes = [];
    subscribes.forEach((s) => {
      this.subscribes.push(new RedditSubscribe(this, s));
    });
  };

  get listSubscribes() {
    return this.subscribes.map(({ id, over18, title }) => ({ id, over18, title }));
  }
}
