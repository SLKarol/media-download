import { ipcMain, shell, Notification } from 'electron';
import type Store from 'electron-store';
import type { Telegraf } from 'telegraf';

import { AppSignals } from '@/constants/signals';
import type MenuBuilder from './menu';
import type { Settings } from '@/types/settings';
import type { Reddit } from '@/lib/reddit';
import { saveSettings, getSettings, changeSaveVideoDir } from './settingsHandlers';
import { getVideoInfo, downloadVideo } from './videoHandlers';
import { FileSendTelegram, PropsDownLoadVideo } from '@/types/media';
import {
  sendVideoInTgGroup,
  sendPictureInTgGroup,
  sendMediaGroupToTg,
  sendHolidayNameToTg,
} from './telegramHandlers';
import { getMySubreddit, getRedditNews } from './redditHandlers';
import { downloadPicture } from './pictureHandlers';
import { StatusJournal } from '@/client/mobxStore/journal';
import { getHolydaysToday } from '@/lib/holidays';

export function setHandlers(props: {
  store: Store<Settings>;
  menuBuilder: MenuBuilder;
  reddit: Reddit;
  telegramBot: Telegraf;
}): void {
  const { store, menuBuilder, reddit, telegramBot } = props;
  ipcMain.handle(AppSignals.GET_VIDEO_INFO, (event, ...args) => {
    const [url] = args as string[];
    getVideoInfo({ event, reddit, url });
  });

  ipcMain.handle(AppSignals.SETTINGS_SAVE, (_, ...args) => {
    saveSettings({ menuBuilder, reddit, settings: args[0], store });
  });

  ipcMain.handle(AppSignals.OPEN_URL, (_, ...args) => {
    if (args.length && typeof args[0] === 'string') {
      shell.openExternal(args[0]);
    }
  });

  ipcMain.handle(AppSignals.SETTINGS_GET, (event, ...args) => {
    let nameSettings: string | undefined;
    if (Array.isArray(args) && args.length && typeof args[0] === 'string') {
      [nameSettings] = args;
    }
    getSettings({ event, store, nameSettings });
  });

  ipcMain.handle(AppSignals.CHANGE_SAVE_VIDEO_DIR, (event) => {
    changeSaveVideoDir({ event, store });
  });

  ipcMain.handle(AppSignals.DOWNLOAD_MEDIA, (event, ...args) => {
    const videoInfo: PropsDownLoadVideo = args[0];
    const { idSource, sendVote, idRecord } = videoInfo;
    Promise.all([
      downloadVideo({
        propsDownload: videoInfo,
        savePath: store.get('defaultSavePath'),
        event,
      }),
      new Promise((re) => {
        if (idSource === 'www.reddit.com' && sendVote)
          reddit
            .sendVote(idRecord)
            .then(() => re(true))
            .catch(() => re(false));
        else re(false);
      }),
    ]);
  });

  ipcMain.handle(AppSignals.RECORD_VOTE, (_, ...args) => {
    const { idRecord, idSource } = args[0] as { idRecord: string; idSource: string };
    if (idSource === 'www.reddit.com') {
      reddit.sendVote(idRecord).then(() =>
        new Notification({
          title: '',
          body: 'Голос отдан',
          silent: true,
        }).show(),
      );
    }
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_VIDEO, (event, ...args) => {
    const tgGroups = store.get('telegramGropus').split(',');
    if (tgGroups.length) sendVideoInTgGroup({ ...args[0], event, tgGroups, telegramBot });
  });

  ipcMain.handle(AppSignals.REDDIT_RECEIVE_MY_REDDITS, (event) => {
    getMySubreddit({ event, reddit });
  });

  ipcMain.handle(AppSignals.REDDIT_GET_NEWS, (event, ...args) => {
    const channel = args[0];
    getRedditNews({ channel, event, reddit });
  });

  ipcMain.handle(AppSignals.DOWNLOAD_PICTURE, (event, ...args) => {
    const param = args[0] as {
      image: string;
      idRecord: string;
      sendVote: boolean;
      title: string;
      url: string;
      idSource: string;
    };
    const { sendVote, idSource, ...paramImage } = param;

    Promise.allSettled([
      downloadPicture({
        param: paramImage,
        savePath: store.get('defaultSavePath'),
        event,
      }),
      new Promise((re) => {
        if (idSource === 'www.reddit.com' && sendVote)
          reddit
            .sendVote(paramImage.idRecord)
            .then(() => re(true))
            .catch(() => re(false));
        else re(false);
      }),
    ]);
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_PICTURE, async (event, ...args) => {
    const tgGroups = store.get('telegramGropus').split(',');
    if (tgGroups.length) {
      const param = args[0] as {
        image: string;
        idRecord: string;
        sendVote: boolean;
        title: string;
        url: string;
        idSource: string;
      };
      const { idRecord, title, url } = param;
      // Отдать в статистику инфо, что скачивается файл
      event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
        id: idRecord,
        title,
        status: StatusJournal.TELEGRAM_SENDING,
        description: '',
      });

      await sendPictureInTgGroup({ title, url, tgGroups, telegramBot });

      event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
        id: idRecord,
        title,
        status: StatusJournal.TELEGRAM_SEND,
        description: '',
      });
    }
  });

  ipcMain.handle(AppSignals.TELEGRAM_SEND_MEDIA_GROUP, async (event, ...args) => {
    new Notification({
      title: '',
      body: 'Рассылка отправляется, ждите.',
      silent: true,
    }).show();
    const [media, holidayMessage] = args as [media: FileSendTelegram[], holidayMessage: string];

    const telegramGropus = store.get('telegramGropus').split(',');
    const telegramAdmin = store.get('telegramAdmin');
    if (holidayMessage) {
      await sendHolidayNameToTg({ telegramGropus, telegramBot, holidayMessage });
    }
    await sendMediaGroupToTg({ telegramGropus, media, telegramBot, telegramAdmin });

    new Notification({
      title: '',
      body: 'Рассылка отправлена.',
      silent: true,
    }).show();
  });

  ipcMain.handle(AppSignals.HOLIDAYS_GET, async (event) => {
    const holidays = await getHolydaysToday();
    event.sender.send(AppSignals.HOLIDAYS_RESPONSE, holidays);
  });
}