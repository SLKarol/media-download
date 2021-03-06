import { createContext, useContext } from 'react';

import { SettingsStore } from './settings';
import { UiStateStore } from './uiState';
import { MediaRecordStore } from './mediaRecord';
import { FileStatusStore } from './fileStatus';
import { HolidaysStore } from './holydays';

export class RootStore {
  settingsStore: SettingsStore;

  uiState: UiStateStore;

  videoInfo: MediaRecordStore;

  fileStatus: FileStatusStore;

  holidaysStore: HolidaysStore;

  constructor() {
    this.settingsStore = new SettingsStore(this);
    this.uiState = new UiStateStore(this);
    this.videoInfo = new MediaRecordStore(this);
    this.fileStatus = new FileStatusStore(this);
    this.holidaysStore = new HolidaysStore(this);
  }
}

export const RootStoreContext = createContext<RootStore>({} as RootStore);

export const useRootStore = () => {
  return useContext(RootStoreContext);
};
