/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import type { IpcMainInvokeEvent } from 'electron';
import { Notification } from 'electron';
import log from 'electron-log';
import type { Telegraf } from 'telegraf';
import delay from '@stanislavkarol/delay';

import { StatusFile } from '@client/mobxStore/fileStatus';
import type { DownloaderMedia } from '@/lib/downloaderMedia';
import { TypeMedia } from '@/constants/media';
import { AppSignals } from '@/constants/signals';
import { FileInTelegram, FileSendTelegram } from '@/types/media';
import { sendPicturesToGroups, sendGifsToGroups, sendVideoToTelegram } from '@/lib/telegram';

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
  idVideoSource: string;
  /**
   * пауза между отправками в группу
   */
  delayMs: number;
  downloaderMedia: DownloaderMedia;
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
    idVideoSource,
    delayMs,
    downloaderMedia,
  } = props;

  if (idVideoSource === 'www.youtube.com') {
    return sendYouTubeVideoInTgGroup({ urlVideo, tgGroups, telegramBot, delayMs });
  }

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

  try {
    if (urlAudio) {
      // Выполнить после скачивания файла: Отправить в телеграм
      const runAfterWork = (fileName: string) => {
        // const form = new FormData();
        // form.append('video', fs.createReadStream(fileName));
        sendVideoToTelegram({
          delayMs,
          eventSender: event.sender,
          id,
          inputVideo: { source: fileName },
          telegramBot,
          tgAdmin,
          tgGroups,
          thumb,
          title,
          height,
          width,
        });
      };
      // Скачать файл во временный каталог
      downloaderMedia.runCommonDownload({
        eventSender: event.sender,
        idVideoSource,
        title,
        url: urlVideo,
        urlAudio,
        media: TypeMedia.video,
        runAfterWork,
      });
    } else
      sendVideoToTelegram({
        delayMs,
        eventSender: event.sender,
        id,
        inputVideo: { url: urlVideo },
        telegramBot,
        tgAdmin,
        tgGroups,
        thumb,
        title,
        height,
        width,
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
  caption?: string;
  delayMs: number;
}): Promise<unknown> {
  const { media, telegramBot, telegramGropus, telegramAdmin, caption, delayMs } = params;
  // Отсечь галереи
  const data = media.filter((d) => !d.url.startsWith('https://www.reddit.com/gallery/'));

  // Отправить все файлы в админский чат и получить fileId

  const savedFiles = await Promise.allSettled(
    data.map(({ title, url }) => {
      if (url.toLowerCase().indexOf('.gif') > -1) {
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

  await sendPicturesToGroups({
    pictures: dataWithoutGif,
    telegramBot,
    telegramGropus,
    caption,
    delayMs,
  });
  await sendGifsToGroups({
    pictures: dataWithGif,
    telegramBot,
    telegramGropus,
    caption,
    delayMs,
  });

  return undefined;
}

/**
 * Отправка сообщения в телеграм-группы
 */
export async function sendHolidayNameToTg(params: {
  telegramBot: Telegraf;
  telegramGropus: string[];
  holidayMessage: string;
  /**
   * пауза между отправками в группу
   */
  delayMs: number;
}): Promise<undefined> {
  const { holidayMessage, telegramBot, telegramGropus, delayMs } = params;
  for (const group of telegramGropus) {
    await delay(delayMs);
    await telegramBot.telegram.sendMessage(group.trim(), holidayMessage, {
      allow_sending_without_reply: true,
      protect_content: false,
    });
  }
  return undefined;
}

async function sendYouTubeVideoInTgGroup({
  telegramBot,
  tgGroups,
  urlVideo,
  delayMs,
}: {
  urlVideo: string;
  tgGroups: string[];
  telegramBot: Telegraf;
  /**
   * пауза между отправками в группу
   */
  delayMs: number;
}) {
  for (const group of tgGroups) {
    await telegramBot.telegram.sendMessage(group.trim(), urlVideo, {
      allow_sending_without_reply: true,
      protect_content: false,
    });
    await delay(delayMs);
  }
}
