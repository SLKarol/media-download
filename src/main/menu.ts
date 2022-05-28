import { Menu, BrowserWindow, MenuItem, MenuItemConstructorOptions } from 'electron';
import type Store from 'electron-store';

import { AppSignals } from '@/constants/signals';
import type { Settings } from '@/types/settings';

export default class MenuBuilder {
  // eslint-disable-next-line no-unused-vars
  constructor(private mainWindow: BrowserWindow, private store: Store<Settings>) {}

  buildMenu(): Menu {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    const menu = this.menu();
    Menu.setApplicationMenu(menu);

    return menu;
  }

  private setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  private buildDefaultTemplate() {
    return [
      {
        label: '&File',
        submenu: [
          {
            label: 'Настройки',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow.webContents.send(AppSignals.MENU_SELECT, 'settings');
            },
          },
          { type: 'separator' },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: 'Скачать видео',
        submenu: [
          {
            label: 'По ссылке',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => {
              this.mainWindow.webContents.send(AppSignals.MENU_SELECT, 'enterUrl');
            },
          },
        ],
      },
      {
        label: 'Что нового?',
        submenu: [
          {
            label: 'Reddit',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              this.mainWindow.webContents.send(AppSignals.MENU_SELECT, 'new:reddit');
            },
          },
        ],
      },
      {
        label: 'Отчёты',
        submenu: [
          {
            label: 'Отчёт о загрузке файлов',
            accelerator: 'CmdOrCtrl+D',
            click: () => {
              this.mainWindow.webContents.send(AppSignals.MENU_SELECT, 'reportDownload');
            },
          },
        ],
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                  },
                },
              ],
      },
    ];
  }

  menu(): Menu {
    const template = this.buildDefaultTemplate();
    return Menu.buildFromTemplate(template as (MenuItemConstructorOptions | MenuItem)[]);
  }
}
