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
  previewImages: MediaPreview;
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
}

/**
 * Предпросмотр видео
 */
export interface MediaPreview {
  decoded: string;
  resolutions?: ResponsivePreview[];
  src: string;
  width?: number;
  height?: number;
}

type ResponsivePreview = {
  decoded: string;
  width: number;
};

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
