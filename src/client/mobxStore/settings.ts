import { action, computed, makeObservable, observable } from 'mobx';

import { Settings } from '@/types/settings';
import type { RootStore } from './root';
import { MediaForum } from '@/types/mediaForum';

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
    yaPlakal: { listForums: {} },
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
    const keys = Object.keys(settings);
    keys.forEach((key) => {
      const newVal = settings[key as keyof Settings];
      // Пройтись по всем настройкам, исключая там, где объекты
      if (this.settings[key as keyof Settings] !== newVal && typeof newVal !== 'object') {
        (this.settings as unknown as { [k: string]: string | boolean })[key] = newVal;
      }
      // Перезаписать там, где объекты
      this.settings.yaPlakal = settings.yaPlakal;
    });
  };

  /**
   * Добавить поле "Подтвердить пароль" и такой объект вернуть в форму.
   * Добавить ЯПфорумы
   */
  get uiSettings() {
    const yapForums: Array<{ url: string; description: string }> = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(this.settings.yaPlakal.listForums)) {
      yapForums.push({ description: value, url: key });
    }
    return { ...this.settings, redditPasswordConfirm: this.settings.redditPassword, yapForums };
  }

  /**
   * Форумы ЯП в виде массива
   */
  get yaPlakalForums() {
    const { listForums } = this.settings.yaPlakal;
    const re: MediaForum[] = Object.entries(listForums).reduce((acc, [key, value]) => {
      acc.push({ description: value, url: key });
      return acc;
    }, [] as MediaForum[]);
    return re;
  }
}
