import type { ImagePreview } from 'snoowrap/dist/objects/Submission';
import type { Chapter } from 'ytdl-core';

/**
 * Информация о субтитрах
 */
export interface SubTitlesInformation {
  baseUrl: string;
  languageCode: string;
  languageName: string;
}

/**
 * Информация о видео
 */
export interface MediaSummary {
  /**
   * ID Video
   */
  id: string;
  /**
   * ID источника видео
   */
  idVideoSource: string;
  title: string;
  previewImages: Partial<MediaPreview>;
  subReddit?: string;
  over18: boolean;
  haveVideo: boolean;
  videoParts: VideoParts;
  width?: number;
  height?: number;
  /**
   * Скаченное видео
   */
  downloadedFileName: string;

  /**
   * Для Reddit
   */
  permalink?: string;

  /**
   * Ссылка на медиа-ресурс
   */
  url?: string;

  /**
   * JSON-date создания записи
   */
  created?: string;

  /**
   * Доступные субтитры
   */
  subtitles?: SubTitlesInformation[];

  /**
   * Как медиа-ресурс разбит на части
   */
  chapters?: Chapter[];
}

/**
 * Предпросмотр видео
 */
export interface MediaPreview {
  decoded: string;
  src: string;
  width?: number;
  height?: number;
}

export type VideoParts = {
  urlVideo: string;
  urlAudio?: string;
};

export interface PropsDownLoadVideo {
  /**
   * Откуда видео: Реддит или ещё где какое
   */
  idSource: string;
  /**
   * ID записи в реддите или ещё где
   */
  idRecord: string;
  urlVideo: string;
  urlAudio: string | undefined;
  sendVote?: boolean;
  title: string;
}

export interface YaplakalApiResponse {
  player: {
    title: string;
    poster: string;
    file: string;
    file_hd: string | null;
    res: string;
  };
}

export interface RedGifsJson {
  video: {
    /**
     * URL видео
     */
    contentUrl: string;
    height: number;
    width: number;
    name: string;
    /**
     * Постер
     */
    thumbnailUrl: string;
  };
}

export interface ImgurPostData {
  id: string;
  title: string;
  media: {
    url: string;
    width: number;
    height: number;
  };
}

export interface MediaSummaryUi extends MediaSummary {
  dimensions: string;
  unSupportTelegram: boolean | undefined;
  /**
   * Есть ли возможность разбить на части?
   */
  hasChapters?: boolean;
}

export interface FileSendTelegram {
  id: string;
  url: string;
  title: string;
  unSupportTelegram: boolean;
}

export type FileInTelegram = {
  id: string;
  title: string;
  animation: boolean;
};

/**
 * Медиаресурс с предпросмотром
 */
export interface MediaSummaryPreview extends MediaSummary {
  preview?: { enabled?: boolean; images: ImagePreview[] };
}
