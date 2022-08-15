/* eslint-disable no-unused-vars */
import { makeAutoObservable } from 'mobx';

import type { RootMediaNewsStore } from './rootMediaNews';
import { MediaRecordStore } from './mediaRecord';
import type { MediaSummaryUi, MediaSummaryPreview, MediaPreview, MediaAlbum } from '@/types/media';
import { MediaActions } from '@/client/constants/mediaActions';
import { HasPrevNextPage } from '@/types/mediaForum';
import { dateTimeToString } from '@/client/lib/date';

export class MediaNewsContentStore {
  newRecords: Map<string, MediaRecordStore> = new Map();

  after: string | null = null;

  constructor(public rootRedditNewsStore: RootMediaNewsStore) {
    makeAutoObservable(this);
  }

  /**
   * Загрузить список новых записей из reddit
   */
  loadRedditNewRecords = (data: {
    records: MediaSummaryPreview[];
    after: string | null;
    channel: string;
  }) => {
    const { after, records } = data;
    this.after = after;
    records.forEach(this.createNewRecordStore);
  };

  /**
   * Создать запись о медиа и положить в хранилище
   */
  private createNewRecordStore = (value: MediaSummaryPreview) => {
    const newReddit = new MediaRecordStore(this);
    newReddit.setInfo(value);
    this.newRecords.set(value.id, newReddit);
  };

  /**
   * Для вывода инф-ции о новых записях
   */
  get newRecordsUiData(): Partial<MediaSummaryUi>[] {
    const re: Partial<MediaSummaryUi>[] = [];
    this.newRecords.forEach((record) => {
      const {
        title,
        previewImages,
        dimensions,
        haveVideo,
        id,
        unSupportTelegram,
        idVideoSource,
        created,
        collection,
        videoFormats,
        hasPreview,
        noMedia,
      } = record.videoDescription;
      re.push({
        title,
        previewImages,
        dimensions,
        haveVideo,
        id,
        unSupportTelegram,
        idVideoSource,
        created: created ? dateTimeToString(created) : null,
        collection,
        videoFormats,
        hasPreview,
        noMedia,
      });
    });
    return re;
  }

  /**
   * Обработчик действия над медиа
   * @param id Media ID
   * @param action Действие
   */
  onSelectMediaAction = (id: string, action: MediaActions) => {
    const redditRecord = this.newRecords.get(id);
    redditRecord.onClickAction(action);
  };

  clearContent = () => {
    this.newRecords.clear();
  };

  get listIds() {
    return new Set(this.newRecords.keys());
  }

  /**
   * Отправить выбранные медиа в телеграмм.
   * Если есть holidayMessage, то отправит текст сообщения
   */
  sendMediaToTg = (holydayName?: string) => {
    const {
      mediaNewsUI: { mediaToTelegram, sendTitleMedia },
    } = this.rootRedditNewsStore;
    const data: { id: string; title: string; url: string; unSupportTelegram: boolean }[] = [];
    mediaToTelegram.forEach((m) => {
      const { id, title, url, unSupportTelegram = false } = m;
      data.push({ id, title: sendTitleMedia ? title : undefined, url, unSupportTelegram });
    });
    window.electron.ipcRenderer.sendMediaGroupToTg(data, holydayName);
  };

  /**
   * Установить для медия изображение
   */
  setMediaPreview = ({ id, preview }: { id: string; preview: Partial<MediaPreview> }) => {
    const media = this.newRecords.get(id);
    if (media) {
      media.setMediaPreview({ id, preview: preview as MediaPreview });
    }
  };

  loadMediaForum = (data: { media: Partial<MediaSummaryPreview>[]; pages: HasPrevNextPage }) => {
    const { media, pages } = data;
    this.rootRedditNewsStore.mediaNewsUI.setTopicPagesData(pages);
    media.forEach(this.createNewRecordStore);
  };

  get haveRecords() {
    return !!this.newRecords.size;
  }

  /**
   * Записать альбом для медиа, состоящего в группе
   */
  setMediaCollection = ({ id, collection }: { collection: MediaAlbum; id: string }) => {
    const media = this.newRecords.get(id);
    if (media) {
      media.setMediaCollection({ id, collection });
    }
  };
}
