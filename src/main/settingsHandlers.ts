import { app, dialog, BrowserWindow } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import type Store from 'electron-store';

import { AppSignals } from '@/constants/signals';

import type { Settings } from '@/types/settings';
import type { Reddit } from '@/lib/reddit';
import type MenuBuilder from './menu';

/**
 * Обработка сигнало по настройке программы
 */

/**
 * Сохранить настройки
 */
export async function saveSettings(props: {
  store: Store<Settings>;
  settings: Settings;
  reddit: Reddit;
  menuBuilder: MenuBuilder;
}) {
  const { menuBuilder, reddit, settings, store } = props;
  await store.set(settings);
  reddit.reConnect();
  app.applicationMenu = menuBuilder.menu();
}

/**
 * Получить настройки(настройку)
 */
export function getSettings(props: {
  event: IpcMainInvokeEvent;
  store: Store<Settings>;
  nameSettings?: string;
}) {
  const { event, store, nameSettings } = props;
  if (nameSettings) {
    event.sender.send(AppSignals.SETTINGS_SEND_ONE, {
      name: nameSettings,
      value: store.get(nameSettings),
    });
    return;
  }
  event.sender.send(AppSignals.SETTINGS_SEND, store.store);
}

export async function changeSaveVideoDir(props: {
  event: IpcMainInvokeEvent;
  store: Store<Settings>;
}) {
  const { event, store } = props;
  const prevValue = store.get('defaultSavePath');

  const dialogRes = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    defaultPath: prevValue,
    properties: ['openDirectory', 'dontAddToRecent'],
  });
  if (dialogRes.canceled) return;
  store.set('defaultSavePath', dialogRes.filePaths[0]);
  event.sender.send(AppSignals.SETTINGS_SEND, store.store);
}
