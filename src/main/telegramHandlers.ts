/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { randomUUID } from 'crypto';
import type { IpcMainInvokeEvent } from 'electron';
import { app, Notification } from 'electron';
import log from 'electron-log';
import type { Telegraf } from 'telegraf';
import delay from '@stanislavkarol/delay';

import { StatusFile } from '@client/mobxStore/fileStatus';
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
  tgAdmin: string;
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
    tgAdmin,
  } = props;

  // Отдать в статистику инфо, что скачивается файл
  event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
    id,
    title,
    status: StatusFile.TELEGRAM_SENDING,
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

  try {
    // Файл во временный каталог
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
      const { error, fullFileName } = await downloadMedia({
        url: urlVideo,
        urlAudio,
        fileName,
        savePath: tmpPath,
        idRecord: id,
      });

      if (error) {
        log.error(error);
        event.sender.send(AppSignals.BACKEND_ERROR, error);
        return undefined;
      }
      inputVideo.source = fullFileName;
    } else inputVideo.url = urlVideo;

    // Отправить в админскую телеграм-группу
    const sendTgresult = await telegramBot.telegram.sendVideo(tgAdmin, inputVideo, {
      caption: title,
      height,
      width,
      thumb: { url: thumb },
    });
    // В телеграмм-группы отправить ссылку на файл в облаке телеграмм
    const {
      video: { file_id: fileId },
    } = sendTgresult;
    if (fileId) {
      for (const group of tgGroups) {
        await delay(DELAY_SECONDS);
        await telegramBot.telegram.sendVideo(group.trim(), fileId, {
          caption: title,
          height,
          width,
          thumb: { url: thumb },
        });
      }
    }

    event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id,
      title,
      status: StatusFile.TELEGRAM_SEND,
      description: '',
    });
  } catch (e) {
    log.error(e);
    event.sender.send(AppSignals.BACKEND_ERROR, e);
  }
  return undefined;
}

export async function sendPictureInTgGroup(params: {
  title: string;
  url: string;
  tgGroups: string[];
  telegramBot: Telegraf;
  tgAdmin: string;
}): Promise<boolean> {
  const { title, url, telegramBot, tgGroups, tgAdmin } = params;
  // Получить из URL'a имя файла
  const ext = url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();

  if (ext !== 'gif') {
    // Отправляется в первую группу
    const sendTgresult = await telegramBot.telegram.sendPhoto(tgAdmin, { url }, { caption: title });
    // Если есть другие группы, то в них отправить ссылку на файл в облаке телеграмм
    const {
      photo: [{ file_id: fileId }],
    } = sendTgresult;
    // Отправить в остальные группы
    if (fileId) {
      const promises = tgGroups.map((group) =>
        telegramBot.telegram.sendPhoto(group.trim(), fileId, { caption: title }),
      );
      await Promise.allSettled(promises);
    }

    return true;
  }
  // Отправляется gif
  const sendTgresult = await telegramBot.telegram.sendAnimation(
    tgAdmin,
    { url },
    { caption: title },
  );
  // Если есть другие группы, то в них отправить ссылку на файл в облаке телеграмм
  let fileId = '';
  if ('animation' in sendTgresult) {
    fileId = sendTgresult.animation.file_id;
  } else {
    fileId = (sendTgresult as unknown as CombineAnimationType).video.file_id;
  }
  // Отправить в остальные группы
  if (fileId) {
    const promises = tgGroups.map((group) =>
      telegramBot.telegram.sendAnimation(group.trim(), fileId, { caption: title }),
    );
    await Promise.allSettled(promises);
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
