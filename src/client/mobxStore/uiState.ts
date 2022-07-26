import { makeAutoObservable } from 'mobx';
import { StatusFile } from './fileStatus';

import type { RootStore } from './root';

export class UiStateStore {
  /**
   * Приложение занято (обычно это запрос http(s))
   */
  appBusy = false;

  /**
   * Показывать диалог выбора частей у медиа-ресурса?
   */
  showDialogSelectChapters = false;

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
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

  /**
   * Переключатель состояния
   * "показывать диалог выбора частей"
   */
  toggleShowDialogSelectChapters = () => {
    this.showDialogSelectChapters = !this.showDialogSelectChapters;
  };
}
