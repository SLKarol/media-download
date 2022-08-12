/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
import { Context, Telegraf } from 'telegraf';
import delay from '@stanislavkarol/delay';
import type { WebContents } from 'electron';

import { StatusFile } from '@client/mobxStore/fileStatus';
import { FileInTelegram } from '@/types/media';
import { AppSignals } from '@/constants/signals';

/**
 * Отправить полезную информацию
 */
function whoami(ctx: Context) {
  const { id, username, first_name, last_name } = ctx.from;
  return ctx.replyWithMarkdown(`Кто ты в телеграмме:
*id* : ${id}
*username* : ${username}
*Имя* : ${first_name}
*Фамилия* : ${last_name}
*chatId* : ${ctx.chat.id}`);
}

/**
 * Запуск и настройка телеграм-бота
 */
export function runTelegramBot(token: string) {
  const telegramBot = new Telegraf(token);
  telegramBot.command('whoami', whoami);

  telegramBot.launch();
  return telegramBot;
}

type SendPicturesToGroup = {
  pictures: FileInTelegram[];
  telegramBot: Telegraf;
  telegramGropus: string[];
  /**
   * Используется для коллекций: Если в FileInTelegram не задан title, то выводится caption
   */
  caption?: string;
  /**
   * пауза между отправками в группу
   */
  delayMs: number;
};

/**
 * Отправить картинки в телеграм-группы
 */
export async function sendPicturesToGroups({
  pictures,
  telegramBot,
  telegramGropus,
  caption,
  delayMs,
}: SendPicturesToGroup) {
  // Получить группу по 10 изображений
  const size = 10;
  // Получить массив из частей по size штук
  const mediaMessages: FileInTelegram[][] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < Math.ceil(pictures.length / size); i++) {
    const array = pictures.slice(i * size, i * size + size);
    // Подготовить эти 10 записей к отправке в телеграм
    mediaMessages[i] = [...array];
  }

  for (const group of telegramGropus) {
    for (const media of mediaMessages) {
      await delay(delayMs);
      await telegramBot.telegram.sendMediaGroup(
        group.trim(),
        media.map(({ id, title }) => ({ type: 'photo', media: id, caption: title || caption })),
        { allow_sending_without_reply: true, protect_content: false },
      );
    }
  }
}

export async function sendGifsToGroups({
  pictures,
  telegramBot,
  telegramGropus,
  caption,
  delayMs,
}: SendPicturesToGroup) {
  for (const group of telegramGropus) {
    for (const media of pictures) {
      await delay(delayMs);
      await telegramBot.telegram.sendAnimation(group.trim(), media.id, {
        caption: media.title || caption,
        allow_sending_without_reply: true,
        protect_content: false,
      });
    }
  }
}

/**
 * Отправить видео в телеграмм
 */
export async function sendVideoToTelegram({
  inputVideo,
  tgAdmin,
  telegramBot,
  title,
  height,
  width,
  thumb,
  tgGroups,
  delayMs,
  eventSender,
  id,
}: {
  inputVideo: { source?: string; url?: string };
  tgAdmin: string;
  telegramBot: Telegraf;
  title: string;
  height?: number;
  width?: number;
  thumb: string;
  tgGroups: string[];
  /**
   * пауза между отправками в группу
   */
  delayMs: number;
  eventSender: WebContents;
  id: string;
}) {
  // Отправить в админскую телеграм-группу

  const sendTgresult = await telegramBot.telegram.sendVideo(
    tgAdmin,
    inputVideo as { source: string },
    {
      caption: title,
      height,
      width,
      thumb: { url: thumb },
    },
  );

  // В телеграмм-группы отправить ссылку на файл в облаке телеграмм
  const {
    video: { file_id: fileId },
  } = sendTgresult;
  if (fileId) {
    for (const group of tgGroups) {
      await delay(delayMs);
      await telegramBot.telegram.sendVideo(group.trim(), fileId, {
        caption: title,
        height,
        width,
        thumb: { url: thumb },
      });
    }
  }

  eventSender.send(AppSignals.JOURNAL_ADD_RECORD, {
    id,
    title,
    status: StatusFile.TELEGRAM_SEND,
    description: '',
  });
}
