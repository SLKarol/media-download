import { makeAutoObservable } from 'mobx';

import type { RootStore } from './root';
import { MediaActions } from '@/client/constants/mediaActions';
import type { RedditNewsContentStore } from './redditNewsContent';
import { MediaSummary } from '@/types/media';
import { IMAGE_SIZE_LIMIT, IMAGE_SUM_DIMENSION_LIMIT } from '@/constants/telegram';
import { isCorrectRatio } from '@/lib/images';

const initialStateMediaSummary: MediaSummary = {
  haveVideo: false,
  id: '',
  over18: false,
  previewImages: { decoded: '', src: '' },
  title: 'Содержимое не доступно',
  subReddit: '',
  videoParts: { urlVideo: '', urlAudio: undefined },
  idVideoSource: '',
  width: undefined,
  height: undefined,
  downloadedFileName: '',
  permalink: '',
};

export class MediaRecordStore {
  info: MediaSummary = { ...initialStateMediaSummary };

  sendVote = true;

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore | RedditNewsContentStore) {
    makeAutoObservable(this);
  }

  /**
   * Установить информацию
   */
  setInfo = (value: MediaSummary) => {
    this.info = { ...value };
  };

  setSendVote = () => {
    this.sendVote = !this.sendVote;
  };

  get isVideoReddit() {
    return this.info.idVideoSource === 'www.reddit.com';
  }

  clearInfo = () => {
    this.info = { ...initialStateMediaSummary };
  };

  get videoDescription() {
    const { width, height, previewImages, ...info } = this.info;
    // Размеры изображения
    let dimensions =
      typeof width === 'number' && typeof height === 'number' ? `${width}x${height}` : '';
    if (!dimensions) {
      const { height: h, width: w } = previewImages;
      dimensions = `${w}${w ? 'x' : ''}${h}`;
    }

    // Не поддерживается телеграм?
    let unSupportTelegram: boolean;
    const { decoded } = previewImages;
    if (typeof width === 'number' && typeof height === 'number') {
      const sum = width + height;
      unSupportTelegram =
        sum < IMAGE_SUM_DIMENSION_LIMIT &&
        isCorrectRatio(width, height) &&
        decoded.length < IMAGE_SIZE_LIMIT;
    } else {
      const { height: h, width: w } = previewImages;
      const sum = w + h;
      unSupportTelegram =
        sum < IMAGE_SUM_DIMENSION_LIMIT &&
        isCorrectRatio(w, h) &&
        decoded.length < IMAGE_SIZE_LIMIT;
    }

    return { ...info, width, height, dimensions, previewImages, unSupportTelegram };
  }

  /**
   * Записать полное имя скаченного файла
   */
  writeFullName = (downloadedFileName: string) => {
    this.info.downloadedFileName = downloadedFileName;
  };

  /**
   * Реакция на действие над медиа
   */
  onClickAction = (userAction: MediaActions) => {
    if (userAction === MediaActions.DOWNLOAD_MEDIA) {
      if (this.info.haveVideo) return this.downloadVideo();
      return this.downloadPicture();
    }
    if (userAction === MediaActions.SEND_TO_TELEGRAM) {
      if (this.info.haveVideo) return this.sendVideoToTelegram();
      return this.sendPictureToTelegram();
    }
    if (userAction === MediaActions.COPY_TO_CLIP_BOARD) return this.copyToClipBoard();
    if (userAction === MediaActions.VOTE) return this.voteRecord();
    if (userAction === MediaActions.OPEN_IN_BROWSER) return this.openInBrowser();
    return undefined;
  };

  /**
   * Скачать видео
   */
  downloadVideo = () => {
    const {
      id: idRecord,
      videoParts: { urlVideo, urlAudio = '' },
      title,
      idVideoSource: idSource,
    } = this.info;
    const { sendVote } = this;
    window.electron.ipcRenderer.downloadVideo({
      urlAudio,
      urlVideo,
      idRecord,
      sendVote,
      title,
      idSource,
    });
  };

  /**
   * Отправить видео в телеграм
   */
  sendVideoToTelegram = () => {
    const {
      id,
      videoParts: { urlVideo, urlAudio },
      title,
      height,
      width,
      previewImages: { src },
      downloadedFileName,
    } = this.info;
    window.electron.ipcRenderer.sendVideoToTg({
      id,
      urlVideo,
      urlAudio,
      title,
      height,
      width,
      thumb: src,
      downloadedFileName,
    });
  };

  /**
   * Скопировать адрес медиа в буфер обмена
   */
  copyToClipBoard = () => {
    const { videoParts, haveVideo, url } = this.info;
    if (haveVideo && videoParts)
      return window.electron.ipcRenderer.copyTextToClipBoard(videoParts.urlVideo);
    return window.electron.ipcRenderer.copyTextToClipBoard(url);
  };

  /**
   * Проголосовать за запись
   */
  voteRecord = () => {
    const { id, idVideoSource } = this.info;
    window.electron.ipcRenderer.voteRecord({
      idRecord: id,
      idSource: idVideoSource,
    });
  };

  openInBrowser = () => {
    const { idVideoSource, permalink, url } = this.info;
    if (permalink) {
      return window.electron.ipcRenderer.openUrl(`https://${idVideoSource}${permalink}`);
    }
    if (url) {
      return window.electron.ipcRenderer.openUrl(url);
    }
    return window.electron.ipcRenderer.openUrl(idVideoSource);
  };

  downloadPicture = () => {
    const {
      id: idRecord,
      url,
      title,
      previewImages: { decoded },
      idVideoSource,
    } = this.info;
    const { sendVote } = this;
    window.electron.ipcRenderer.downloadPicture({
      image: decoded,
      idRecord,
      sendVote,
      title,
      url,
      idSource: idVideoSource,
    });
  };

  /**
   * Отправить картинку в телеграм
   */
  sendPictureToTelegram = () => {
    const {
      id,
      title,
      previewImages: { decoded },
      url,
    } = this.info;
    window.electron.ipcRenderer.sendPictureToTg({
      id,
      title,
      url,
      image: decoded,
    });
  };
}
