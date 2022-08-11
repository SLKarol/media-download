export interface Settings {
  redditUserName: string;
  redditPassword: string;
  redditAppId: string;
  redditApiSecret: string;
  defaultSavePath: string;
  telegramToken: string;
  telegramGropus: string;
  telegramAdmin: string;
  yaPlakal: {
    /**
     * {'urlOfForum':"Название форума"}
     */
    listForums: { [U: string]: string };
  };

  /**
   * количество записей, которое взять из reddit
   */
  redditLimitRecords: number;

  /**
   * Ожидание между отправками в телеграм-группы
   */
  waitMsWhenSendTelegram: number;

  /**
   * Шаблон текста-поздравления
   */
  descriptionHoliday: string;
}

/**
 * Структура для формы
 */
export interface FormStateSettings extends Settings {
  redditPasswordConfirm: string;
  yapForums: { url: string; description: string }[];
}
