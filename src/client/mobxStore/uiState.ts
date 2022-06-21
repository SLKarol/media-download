import { action, computed, makeObservable, observable } from 'mobx';
import { StatusFile } from './fileStatus';

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
    const { listingJournal } = this.rootStore.fileStatus;
    const oneVideoId = this.rootStore.videoInfo.info.id;
    const journalRecord = listingJournal.find((r) => r.id === oneVideoId);
    const disabled = this.appBusy || (journalRecord && journalRecord.status === StatusFile.LOADING);
    return disabled;
  }
}
