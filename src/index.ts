import { app, BrowserWindow } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  MOBX_DEVTOOLS,
} from 'electron-devtools-installer';
import * as dotenv from 'dotenv';
import Store from 'electron-store';
import type { Telegraf } from 'telegraf';

import MenuBuilder from './main/menu';
import { setHandlers } from './main/setHandlers';
import type { Settings } from './types/settings';
import { Reddit } from './lib/reddit';
import { runTelegramBot } from './lib/telegram';

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

dotenv.config();
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const createWindow = (): void => {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
    show: false,
    center: true,
  });
  // Создать хранилище настроек
  const store = new Store<Settings>({
    defaults: {
      redditApiSecret: '',
      redditAppId: '',
      redditPassword: '',
      redditUserName: '',
      loadResponsePreview: true,
      defaultSavePath: app.getPath('videos'),
      telegramToken: '',
      telegramGropus: '',
      telegramAdmin: '',
    },
  });
  const menuBuilder = new MenuBuilder(mainWindow, store);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open the DevTools.
  if (isDevelopment) mainWindow.webContents.openDevTools();

  menuBuilder.buildMenu();
  const reddit = new Reddit(store);

  if (process.platform === 'win32') {
    app.setAppUserModelId(app.name);
  }

  const telegramToken = store.get('telegramToken');

  const telegramBot: Telegraf | undefined = telegramToken
    ? runTelegramBot(telegramToken)
    : undefined;
  setHandlers({ menuBuilder, store, reddit, telegramBot });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.whenReady().then(() => {
  installExtension([MOBX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});