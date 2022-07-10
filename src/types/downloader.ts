import type { ClientRequest as HttpClientRequest } from 'http';
import type { Readable } from 'stream';
import type { ChildProcess } from 'child_process';
import type { WebContents, ClientRequest } from 'electron';

import type { TypeMedia } from '@/constants/media';

/**
 * Параметры для добавления ресурса на скачивание
 */
export interface ParamsAddDownload {
  /**
   * См. src\constants\videoSrc.ts
   */
  idVideoSource: string;

  /**
   * Для получения ссылки на ресурс
   */
  permalink?: string;

  /**
   * Тип скачиваемого медиа
   */
  media: TypeMedia;

  /**
   * URL субтитров
   */
  subtitle?: string;

  /**
   * 'xml', 'ttml', 'vtt', 'srv1', 'srv2', 'srv3'
   */
  subtitleType?: string;

  /**
   * 'en', 'ru', etc...
   */
  subtitleLanguageCode?: string;

  /**
   * Название
   */
  title: string;

  /**
   * URL медиа-ресурса
   */
  url: string;
  /**
   * URL audio-ресурса
   */
  urlAudio?: string | undefined;
}

export interface ParamsSenderAddDownload extends ParamsAddDownload {
  eventSender: WebContents;
}

export interface DownloadValues {
  downloaded: number;
  total: number;
}

/**
 * Прогресс загрузки
 */
export interface DownloadProgress {
  /**
   * Данные по аудио
   */
  audio?: DownloadValues;

  /**
   * Данные по видео
   */
  video?: DownloadValues;

  /**
   * Данные по субтитрам
   */
  subtitle?: DownloadValues;

  /**
   * Данные по картинке
   */
  picture?: DownloadValues;
}

export interface DownloadState extends DownloadProgress {
  /**
   * Вид скачиваемого медиа
   */
  media: TypeMedia;
  /**
   * ID периодичности отправки прогресса скачивания
   */
  intervalId?: ReturnType<typeof setInterval> | number;
  /**
   * Поток ютуб-видео (без аудио)
   */
  youTubeAudioStream?: Readable;
  /**
   * Поток ютуб-аудио
   */
  youTubeVideoStream?: Readable;
  /**
   * Указатель на http request: для того, чтобы можно было удобно его завершить при отмене скачивания
   */
  request?: ClientRequest | HttpClientRequest;
  requestAudio?: ClientRequest | HttpClientRequest;
  /**
   * Указатель на дочерний процесс ffmpeg: для того, чтобы можно было удобно его завершить при отмене скачивания
   */
  ffmpegProcess?: ChildProcess;
}
