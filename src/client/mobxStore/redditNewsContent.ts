/* eslint-disable no-unused-vars */
import { makeAutoObservable } from 'mobx';

import type { RootRedditNewsStore } from './redditNews';
import { MediaRecordStore } from './mediaRecord';
import type { MediaSummaryUi, MediaSummaryPreview, MediaPreview } from '@/types/media';
import { MediaActions } from '@/client/constants/mediaActions';

export class RedditNewsContentStore {
  newRecords: Map<string, MediaRecordStore> = new Map();

  constructor(private rootRedditNewsStore: RootRedditNewsStore) {
    makeAutoObservable(this);
  }

  /**
   * Загрузить список новых записей из reddit
   */
  loadRedditNewRecords = (records: MediaSummaryPreview[]) => {
    // Удалить старые данные
    this.newRecords.clear();
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
      const { title, previewImages, dimensions, haveVideo, id, unSupportTelegram } =
        record.videoDescription;
      re.push({ title, previewImages, dimensions, haveVideo, id, unSupportTelegram });
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
  sendMediaToTg = (holidayMessage?: string) => {
    const {
      redditNewsUI: { mediaToTelegram },
    } = this.rootRedditNewsStore;
    const data: { id: string; title: string; url: string; unSupportTelegram: boolean }[] = [];
    mediaToTelegram.forEach((m) => {
      const { id, title, url, unSupportTelegram = false } = m;
      data.push({ id, title, url, unSupportTelegram });
    });
    window.electron.ipcRenderer.sendMediaGroupToTg(data, holidayMessage);
  };

  /**
   * Установить для медия изображение
   */
  setMediaPreview = ({ id, preview }: { id: string; preview: MediaPreview }) => {
    const media = this.newRecords.get(id);
    if (media) {
      media.setMediaPreview({ id, preview });
    }
  };
}
