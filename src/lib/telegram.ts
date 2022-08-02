/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
import { Context, Telegraf } from 'telegraf';
import delay from '@stanislavkarol/delay';

import { FileInTelegram } from '@/types/media';
import { DELAY_SECONDS } from '@/constants/telegram';

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
};

/**
 * Отправить картинки в телеграм-группы
 */
export async function sendPicturesToGroups({
  pictures,
  telegramBot,
  telegramGropus,
  caption,
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
      await delay(DELAY_SECONDS);
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
}: SendPicturesToGroup) {
  for (const group of telegramGropus) {
    for (const media of pictures) {
      await delay(DELAY_SECONDS);
      await telegramBot.telegram.sendAnimation(group.trim(), media.id, {
        caption: media.title || caption,
        allow_sending_without_reply: true,
        protect_content: false,
      });
    }
  }
}
