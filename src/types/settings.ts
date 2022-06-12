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
}

/**
 * Структура для формы
 */
export interface FormStateSettings extends Settings {
  redditPasswordConfirm: string;
  yapForums: { url: string; description: string }[];
}
