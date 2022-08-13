import { makeAutoObservable, toJS } from 'mobx';

import { TypeMedia } from '@/constants/media';
import type { RootStore } from './root';
import { MediaActions } from '@/client/constants/mediaActions';
import type { MediaNewsContentStore } from './mediaNewsContent';
import { MediaAlbum, MediaPreview, MediaSummary } from '@/types/media';
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
  created: '',
  url: '',
  chapters: undefined,
  collection: undefined,
};

export class MediaRecordStore {
  info: MediaSummary = { ...initialStateMediaSummary };

  sendVote = true;

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore | MediaNewsContentStore) {
    makeAutoObservable(this);
  }

  /**
   * Установить информацию
   */
  setInfo = (value: MediaSummary) => {
    // Выбрать все пропсы, чтобы отсечь лишнее
    const {
      downloadedFileName,
      haveVideo,
      id,
      idVideoSource,
      over18,
      previewImages,
      title,
      videoParts,
      height,
      permalink,
      subReddit,
      url,
      width,
      created,
      subtitles,
      chapters,
      listFormats,
    } = value;
    this.info = {
      downloadedFileName,
      haveVideo,
      id,
      idVideoSource,
      over18,
      previewImages,
      title,
      videoParts,
      height,
      permalink,
      subReddit,
      url,
      width,
      created,
      subtitles,
      chapters,
      listFormats,
    };
  };

  setSendVote = () => {
    this.sendVote = !this.sendVote;
  };

  get isVideoReddit() {
    return this.info.idVideoSource === 'www.reddit.com';
  }

  /**
   * Очистить инфо
   */
  clearInfo = () => {
    this.info = { ...initialStateMediaSummary };
  };

  /**
   * Описание видео
   */
  get videoDescription() {
    const {
      width = undefined,
      height = undefined,
      previewImages = {},
      chapters,
      listFormats,
      collection,
      ...info
    } = this.info;
    const { height: previewImageHeight = undefined, width: previewImageWidth = undefined } =
      previewImages;
    // Размеры изображения
    let dimensions = '';

    if (previewImages && 'width' in previewImages && 'height' in previewImages) {
      dimensions =
        previewImageWidth && previewImageHeight
          ? `${previewImageWidth}${previewImageWidth ? 'x' : ''}${previewImageHeight}`
          : '';
    }
    if (!dimensions && typeof width === 'number' && typeof height === 'number') {
      dimensions = `${width}x${height}`;
    }

    // Не поддерживается телеграм?
    let unSupportTelegram: boolean;
    const { decoded = '' } = previewImages;
    if (typeof width === 'number' && typeof height === 'number') {
      const sum = width + height;
      unSupportTelegram =
        sum < IMAGE_SUM_DIMENSION_LIMIT &&
        isCorrectRatio(width, height) &&
        decoded.length < IMAGE_SIZE_LIMIT;
    } else {
      const sum = previewImageWidth + previewImageHeight;
      unSupportTelegram =
        sum < IMAGE_SUM_DIMENSION_LIMIT &&
        isCorrectRatio(previewImageWidth, previewImageHeight) &&
        decoded.length < IMAGE_SIZE_LIMIT;
    }
    const hasChapters = Array.isArray(chapters) && chapters.length > 0;
    const videoFormats = listFormats ? Array.from(listFormats.keys()) : undefined;
    let hasPreview = !!decoded;

    if (collection) {
      hasPreview = Object.values(collection).every((c) => !!c.data);
    }
    return {
      ...info,
      width,
      height,
      dimensions,
      previewImages,
      unSupportTelegram,
      hasChapters,
      videoFormats,
      collection,
      hasPreview,
    };
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
      if (this.info.collection) return this.downloadCollection();
      return this.downloadPicture();
    }
    if (userAction === MediaActions.SEND_TO_TELEGRAM) {
      if (this.info.haveVideo) return this.sendVideoToTelegram();
      if (this.info.collection) return this.sendCollectionToTelegram();
      return this.sendPictureToTelegram();
    }
    if (userAction === MediaActions.COPY_TO_CLIP_BOARD) return this.copyToClipBoard();
    if (userAction === MediaActions.VOTE) return this.voteRecord();
    if (userAction === MediaActions.OPEN_IN_BROWSER) return this.openInBrowser();
    if (userAction === MediaActions.SELECT_CHAPTERS) return this.selectChapters();
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
    let titleVideo = title;
    if (idSource === 'www.yaplakal.com') {
      const { name } = (this.rootStore as MediaNewsContentStore).rootRedditNewsStore.mediaNewsUI
        .selectedTopic;
      titleVideo = name;
    }

    window.electron.ipcRenderer.downloadVideo({
      urlAudio,
      urlVideo,
      idRecord,
      sendVote: idSource === 'www.reddit.com' ? sendVote : false,
      title: titleVideo.length ? titleVideo : 'video',
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
      idVideoSource,
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
      idVideoSource,
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
    let openUrl = permalink;
    if (!openUrl.startsWith('http')) {
      openUrl = `https://${idVideoSource}${permalink}`;
    }
    if (permalink) {
      return window.electron.ipcRenderer.openUrl(openUrl);
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
      idVideoSource,
    } = this.info;
    window.electron.ipcRenderer.sendPictureToTg({
      id,
      title: idVideoSource === 'www.reddit.com' ? title : '',
      url,
      image: decoded,
    });
  };

  /**
   * Установить media Preview
   */
  setMediaPreview = ({ id, preview }: { id: string; preview: MediaPreview }) => {
    if (this.info.id === id) {
      this.info.previewImages = { ...preview };
    }
  };

  /**
   * Скачать ютуб-ресурс
   */
  onClickDownloadYouTube = ({
    media,
    subtitle,
    subtitleLanguageCode,
    subtitleType,
    videoQuality,
  }: {
    media: TypeMedia;
    subtitle: string;
    subtitleType: string;
    subtitleLanguageCode: string;
    videoQuality: string;
  }) => {
    const { permalink, title, idVideoSource, listFormats } = this.info;
    const mediaFormats = listFormats.get(videoQuality);

    window.electron.ipcRenderer.downloadYoutube({
      media,
      subtitle,
      subtitleLanguageCode,
      subtitleType,
      permalink,
      title,
      idVideoSource,
      itagQuality: [...mediaFormats],
    });
  };

  selectChapters = () => {
    (this.rootStore as RootStore).uiState.toggleShowDialogSelectChapters();
  };

  /**
   * Записать данные о коллекции
   */
  setMediaCollection = ({ collection, id }: { collection: MediaAlbum; id: string }) => {
    if (id !== this.info.id) return undefined;
    this.info.collection = collection;
    return undefined;
  };

  /**
   * Скачать коллекцию изображений
   */
  downloadCollection = () => {
    const { id: idRecord, url, title, idVideoSource, collection } = this.info;
    const { sendVote } = this;
    window.electron.ipcRenderer.downloadCollection({
      collection: toJS(collection),
      idRecord,
      sendVote,
      title,
      url,
      idSource: idVideoSource,
    });
  };

  sendCollectionToTelegram = () => {
    const { id: idRecord, title, idVideoSource, collection } = this.info;
    window.electron.ipcRenderer.sendCollectionToTelegram({
      collection: toJS(collection),
      idRecord,
      title,
      idSource: idVideoSource,
    });
  };
}
