import { action, computed, makeObservable, observable } from 'mobx';
import { StatusJournal } from './journal';

import type { RootStore } from './root';

export class UiStateStore {
  /**
   * Приложение занято (обычно это запрос https(s))
   */
  appBusy = false;

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeObservable(
      this,
      {
        appBusy: observable,
        setAppBusy: action,
        oneVideoDisabled: computed,
      },
      { autoBind: true },
    );
  }

  /**
   * Изменить состояние приложения
   */
  setAppBusy = (value: boolean) => {
    this.appBusy = value;
  };

  get oneVideoDisabled() {
    const { listingJournal } = this.rootStore.journalStore;
    const oneVideoId = this.rootStore.videoInfo.info.id;
    const journalRecord = listingJournal.find((r) => r.id === oneVideoId);
    const disabled =
      this.appBusy || (journalRecord && journalRecord.status === StatusJournal.LOADING);
    return disabled;
  }
}
