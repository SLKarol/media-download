/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import type { IpcMainInvokeEvent } from 'electron';
import { app, Notification } from 'electron';
import type { Telegraf } from 'telegraf';
import delay from '@stanislavkarol/delay';

import { StatusJournal } from '@client/mobxStore/journal';
import { DELAY_SECONDS } from '@/constants/telegram';
import { AppSignals } from '@/constants/signals';
import { createFullFileName } from '@/lib/files';
import { downloadMedia } from '@/lib/videos';
import { FileInTelegram, FileSendTelegram } from '@/types/media';
import { sendPicturesToGroups, sendGifsToGroups } from '@/lib/telegram';

type CombineAnimationType = { animation: { file_id: string }; video: { file_id: string } };

/**
 * Отправить файл в телеграм
 */
export async function sendVideoInTgGroup(props: {
  event: IpcMainInvokeEvent;
  id: string;
  urlVideo: string;
  urlAudio?: string;
  title: string;
  height?: number;
  width?: number;
  tgGroups: string[];
  telegramBot: Telegraf;
  thumb: string;
  downloadedFileName: string;
}): Promise<void> {
  const {
    event,
    id,
    urlVideo,
    urlAudio,
    title,
    height,
    width,
    tgGroups,
    telegramBot,
    thumb,
    downloadedFileName,
  } = props;

  // Отдать в статистику инфо, что скачивается файл
  event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
    id,
    title,
    status: StatusJournal.TELEGRAM_SENDING,
    description: '',
  });
  new Notification({
    title,
    body: 'Отправляется в телеграм',
    silent: true,
  }).show();
  const inputVideo: { source: string | undefined; url: string | undefined } = {
    source: undefined,
    url: undefined,
  };

  // Есть ли такой файл в числе скаченных?
  if (downloadedFileName && existsSync(downloadedFileName)) {
    inputVideo.source = downloadedFileName;
  } else {
    // Если файл скачивать, то во временный каталог
    if (urlAudio) {
      const tmpPath = app.getPath('temp');
      // Получить имя файла
      const fileName = createFullFileName({
        savePath: tmpPath,
        title: randomUUID(),
        urlAudio,
        url: urlVideo,
      });
      // Скачать файл во временный каталог
      const result = await downloadMedia({
        url: urlVideo,
        urlAudio,
        fileName,
        savePath: tmpPath,
        idRecord: id,
      });

      if (result) return undefined;
      inputVideo.source = result.fullFileName;
    }
    inputVideo.url = urlVideo;
  }

  // Отправить в первую телеграм-группу
  const sendTgresult = await telegramBot.telegram.sendVideo(tgGroups[0].trim(), inputVideo, {
    caption: title,
    height,
    width,
    thumb: { url: thumb },
  });
  // Если есть другие группы, то в них отправить ссылку на файл в облаке телеграмм
  if (tgGroups.length > 1) {
    const {
      video: { file_id: fileId },
    } = sendTgresult;
    // Отправить в остальные группы
    if (fileId) {
      const promises = tgGroups.slice(1).map((group) =>
        telegramBot.telegram.sendVideo(group.trim(), fileId, {
          caption: title,
          height,
          width,
          thumb: { url: thumb },
        }),
      );
      await Promise.allSettled(promises);
    }
  }
  if (inputVideo.source && !downloadedFileName) {
    await rm(inputVideo.source);
  }
  event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
    id,
    title,
    status: StatusJournal.TELEGRAM_SEND,
    description: '',
  });

  return undefined;
}

export async function sendPictureInTgGroup(params: {
  title: string;
  url: string;
  tgGroups: string[];
  telegramBot: Telegraf;
}): Promise<boolean> {
  const { title, url, telegramBot, tgGroups } = params;
  // Получить из URL'a имя файла
  const ext = url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();

  if (ext !== 'gif') {
    // Отправляется в первую группу
    const sendTgresult = await telegramBot.telegram.sendPhoto(
      tgGroups[0].trim(),
      { url },
      { caption: title },
    );
    // Если есть другие группы, то в них отправить ссылку на файл в облаке телеграмм
    if (tgGroups.length > 1) {
      const {
        photo: [{ file_id: fileId }],
      } = sendTgresult;
      // Отправить в остальные группы
      if (fileId) {
        const promises = tgGroups
          .slice(1)
          .map((group) => telegramBot.telegram.sendPhoto(group.trim(), fileId, { caption: title }));
        await Promise.allSettled(promises);
      }
    }
    return true;
  }
  // Отправляется gif
  const sendTgresult = await telegramBot.telegram.sendAnimation(
    tgGroups[0].trim(),
    { url },
    { caption: title },
  );
  // Если есть другие группы, то в них отправить ссылку на файл в облаке телеграмм
  if (tgGroups.length > 1) {
    let fileId = '';
    if ('animation' in sendTgresult) {
      fileId = sendTgresult.animation.file_id;
    } else {
      fileId = (sendTgresult as unknown as CombineAnimationType).video.file_id;
    }
    // Отправить в остальные группы
    if (fileId) {
      const promises = tgGroups
        .slice(1)
        .map((group) =>
          telegramBot.telegram.sendAnimation(group.trim(), fileId, { caption: title }),
        );
      await Promise.allSettled(promises);
    }
  }

  return true;
}

/**
 * Отправить медиа-группу в telegram
 */
export async function sendMediaGroupToTg(params: {
  media: FileSendTelegram[];
  telegramBot: Telegraf;
  telegramGropus: string[];
  telegramAdmin: string;
}): Promise<unknown> {
  const { media, telegramBot, telegramGropus, telegramAdmin } = params;
  // Отсечь галереи
  const data = media.filter((d) => !d.url.startsWith('https://www.reddit.com/gallery/'));

  // Отправить все файлы в админский чат и получить fileId

  const savedFiles = await Promise.allSettled(
    data.map(({ title, url }) => {
      if (url.toLowerCase().endsWith('.gif')) {
        return telegramBot.telegram
          .sendAnimation(telegramAdmin, url, {
            caption: title,
            protect_content: false,
            allow_sending_without_reply: true,
            disable_notification: true,
          })
          .then((response) => {
            return { id: response.animation.file_id, title, animation: true };
          })
          .catch(() => false);
      }
      return telegramBot.telegram
        .sendPhoto(telegramAdmin, url, {
          caption: title,
          protect_content: false,
          allow_sending_without_reply: true,
          disable_notification: true,
        })
        .then((response) => {
          return { id: response.photo[0].file_id, title, animation: false };
        })
        .catch(() => false);
    }),
  ).then((listImgs) => {
    const files: FileInTelegram[] = [];
    listImgs.forEach((imgResult) => {
      if (imgResult.status === 'fulfilled' && typeof imgResult.value !== 'boolean') {
        files.push(imgResult.value);
      }
    });
    return files;
  });

  // 1. Отправить с GIF
  const dataWithGif = savedFiles.filter((d) => d.animation);
  // 2. Отправить альбомы
  const dataWithoutGif = savedFiles.filter((d) => !d.animation);

  await sendPicturesToGroups({ pictures: dataWithoutGif, telegramBot, telegramGropus });
  await sendGifsToGroups({ pictures: dataWithGif, telegramBot, telegramGropus });

  return undefined;
}

/**
 * Отправка сообщения в телеграм-группы
 */
export async function sendHolidayNameToTg(params: {
  telegramBot: Telegraf;
  telegramGropus: string[];
  holidayMessage: string;
}): Promise<undefined> {
  const { holidayMessage, telegramBot, telegramGropus } = params;
  for (const group of telegramGropus) {
    await delay(DELAY_SECONDS);
    await telegramBot.telegram.sendMessage(group.trim(), holidayMessage, {
      allow_sending_without_reply: true,
      protect_content: false,
    });
  }
  return undefined;
}
