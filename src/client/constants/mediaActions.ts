/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
/**
 * Действия над медиа-контентом
 */
export enum MediaActions {
  /**
   * Скачать медиа-ресурс
   */
  DOWNLOAD_MEDIA = 'downloadMedia',
  /**
   * Отправить в телеграм
   */
  SEND_TO_TELEGRAM = 'sendToTelegram',
  /**
   * Скопировать в буфер обмена
   */
  COPY_TO_CLIP_BOARD = 'copyToClipBoard',
  /**
   * Проголосовать
   */
  VOTE = 'vote',
  /**
   * Открыть в броузере
   */
  OPEN_IN_BROWSER = 'openInBrowser',
  /**
   * Удалить
   */
  DELETE = 'delete',

  /**
   * Выбрать части для скачивания
   */
  SELECT_CHAPTERS = 'selectChapters',
}
