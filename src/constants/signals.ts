/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
/**
 * Коды оповещения
 */
export enum AppSignals {
  /**
   * В меню выбрано "Настройки"
   */
  MENU_SELECT = 'menu:select',

  /**
   * Запрос инфо о видео
   */
  GET_VIDEO_INFO = 'app:get-video-info',
  /**
   * Бэкенд занят, поставить "загрузка"
   */
  BACKEND_BUSY = 'app:backend-busy',
  /**
   * Ошибка от сервера
   */
  BACKEND_ERROR = 'app:backend-error',
  /**
   * Отправить инфо о видео
   */
  SEND_VIDEO_INFO = 'app:send-video-info',

  /**
   * Отправить превью медиа
   */
  SEND_MEDIA_PREVIEW = 'app:send-media-preview',

  /**
   * Отправить превью для медиа, состоящего в группе
   */
  SEND_MEDIA_GROUP_PREVIEW = 'app:send-mediaGroup-preview',

  /**
   * Открыть ссылку в броузере
   */
  OPEN_URL = 'app:open-url',

  /**
   * Сохранить настройки
   */
  SETTINGS_SAVE = 'settings:save',

  /**
   * Запросить настройки
   */
  SETTINGS_GET = 'settings:get',

  /**
   * Получить настройки
   */
  SETTINGS_SEND = 'settings:send',

  /**
   * Получить настройку
   */
  SETTINGS_SEND_ONE = 'settings:send-one',

  /**
   * Изменить каталог сохранения видео
   */
  CHANGE_SAVE_VIDEO_DIR = 'settings:change-save-video-dir',

  /**
   * Скачать видео
   */
  DOWNLOAD_MEDIA = 'download:media',

  /**
   * Оповещение: Добавлено видео для скачивания
   */
  JOURNAL_ADD_RECORD = 'journal:add-record',

  /**
   * Проголосовать за запись
   */
  RECORD_VOTE = 'record:vote',

  /**
   * За видео голос отдан
   */
  RECORD_VOTE_DONE = 'record:vote-done',

  /**
   * Отправить видео через телеграм-бота
   */
  TELEGRAM_SEND_VIDEO = 'telegram:send-video',

  /**
   * Отправить картинку через телеграм-бота
   */
  TELEGRAM_SEND_PICTURE = 'telegram:send-picture',

  /**
   * Запросить список моих субреддитов
   */
  REDDIT_RECEIVE_MY_REDDITS = 'reddit:receive-my-reddits',

  /**
   * Получить список субреддитов
   */
  REDDIT_RESPONSE_MY_REDDITS = 'reddit:response-my-reddits',

  /**
   * Запросить новые записи из Reddit
   */
  REDDIT_GET_NEWS = 'reddit:get-news',

  /**
   * Получить новые записи из Reddit
   */
  REDDIT_RESPONSE_NEWS = 'reddit:response-news',

  /**
   * Скачать видео
   */
  DOWNLOAD_PICTURE = 'download:picture',

  /**
   * Отправить картинку через телеграм-бота
   */
  TELEGRAM_SEND_MEDIA_GROUP = 'telegram:send-media-group',

  /**
   * Запросить список праздников
   */
  HOLIDAYS_GET = 'holidays:get',
  /**
   * Получить список праздников
   */
  HOLIDAYS_RESPONSE = 'holidays:response',
}
