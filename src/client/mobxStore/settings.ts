import { action, computed, makeObservable, observable } from 'mobx';

import { Settings } from '@/types/settings';
import type { RootStore } from './root';

export class SettingsStore {
  settings: Settings = {
    redditApiSecret: '',
    redditAppId: '',
    redditPassword: '',
    redditUserName: '',
    defaultSavePath: '',
    telegramGropus: '',
    telegramToken: '',
    telegramAdmin: '',
  };

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeObservable(
      this,
      {
        settings: observable,
        save: action,
        uiSettings: computed,
      },
      { autoBind: true },
    );
  }

  /**
   * Записать настройки в стор
   */
  save = (settings: Settings) => {
    Object.keys(settings).forEach((key) => {
      const newVal = settings[key as keyof Settings];
      if (this.settings[key as keyof Settings] !== newVal) {
        (this.settings as unknown as { [k: string]: string | boolean })[key] = newVal;
      }
    });
  };

  /**
   * Добавить поле "Подтвердить пароль" и такой объект вернуть в форму
   */
  get uiSettings() {
    return { ...this.settings, redditPasswordConfirm: this.settings.redditPassword };
  }
}
