/* eslint-disable no-unused-vars */
import { makeAutoObservable } from 'mobx';

import { randomIntFromInterval } from '@/lib/utils';
import type { RootMediaNewsStore } from './rootMediaNews';
import { HasPrevNextPage, MediaForum } from '@/types/mediaForum';

export interface MediaToTelegram {
  id: string;
  url: string;
  title: string;
  height?: number;
  width?: number;
  decoded: string;
  unSupportTelegram?: boolean;
}
export class MediaNewsUIStore {
  /**
   * Выбранный канал
   */
  selectedSubscribeId: string | null = null;

  /**
   * Отправлять голосование при скачивании?
   */
  sendVote = true;

  /**
   * Выбранные медиа для отправки в телеграм.
   */
  mediaToTelegram: Map<string, MediaToTelegram> = new Map();

  /**
   * Режим выбора фото.
   * Если не он, то режим отправки фото
   */
  modeSelectMedia = true;

  /**
   * Отправлять название праздника?
   */
  enableSendHolidayName = true;

  /**
   * Выбранный форум
   */
  selectedForum: MediaForum | null = null;

  /**
   * Страницы для топика
   */
  topicPages: HasPrevNextPage = { next: false, prev: false, current: 1 };

  /**
   * Выбранный топик
   */
  selectedTopic: { href: string; name: string } = { href: '', name: '' };

  /**
   * Отправлять заголовок медиа?
   */
  sendTitleMedia = true;

  constructor(private rootStore: RootMediaNewsStore) {
    makeAutoObservable(this);
  }

  /**
   * Изменить выбранный канал
   */
  setSelectedSubscribe = (value: string) => {
    this.selectedSubscribeId = value;
  };

  /**
   * Вернуть выбранный канал со всеми атрибутами или NULL
   */
  get selectedSubscribe() {
    const record = this.rootStore.redditSubscribeStore.listSubscribes.find(
      (s) => s.id === this.selectedSubscribeId,
    );
    return record ? { ...record } : null;
  }

  /**
   * Выбрать случайный канал
   */
  setRandomSubscription = () => {
    const { length: countSubscriptions } = this.rootStore.redditSubscribeStore.subscribes;
    const indx = randomIntFromInterval(1, countSubscriptions) - 1;
    this.selectedSubscribeId = this.rootStore.redditSubscribeStore.subscribes[indx].id;
  };

  /**
   * Изменить "проголосовать при скачивании"
   */
  toggleSendVote = () => {
    this.sendVote = !this.sendVote;
  };

  /**
   * Отдать к-во выбранного медиа/выбранное на текущем канале
   */
  get countMediaToTelegram() {
    // Получить список ID записей выбранного
    const keysMediaIdsRecords = this.rootStore.mediaNewsContentStore.listIds;
    const allSelected = this.mediaToTelegram.size;
    let currentSelected = 0;
    keysMediaIdsRecords.forEach((key) => {
      if (this.mediaToTelegram.has(key)) {
        currentSelected += 1;
      }
    });
    return { allSelected, currentSelected };
  }

  /**
   * Очистить выбранные ID
   */
  clearMediaToTelegramFromChannel = () => {
    this.rootStore.mediaNewsContentStore.listIds.forEach((id) => {
      if (this.mediaToTelegram.has(id)) this.mediaToTelegram.delete(id);
    });
  };

  /**
   * Добавить-убрать медиа в список телеграмм-рассылки
   */
  toggleMediaToTelegram = (idMedia: string) => {
    if (this.mediaToTelegram.has(idMedia)) {
      this.mediaToTelegram.delete(idMedia);
    } else {
      const {
        videoDescription: {
          id,
          url,
          title,
          previewImages: { decoded },
          unSupportTelegram,
        },
      } = this.rootStore.mediaNewsContentStore.newRecords.get(idMedia);
      this.mediaToTelegram.set(idMedia, { id, url, title, decoded, unSupportTelegram });
    }
  };

  /**
   * Переключение режимов работы
   */
  toggleModeSelectMedia = () => {
    this.modeSelectMedia = !this.modeSelectMedia;
  };

  /**
   * Очистить весь список
   */
  clearMediaToTelegram = () => {
    this.mediaToTelegram.clear();
  };

  /**
   * Выбранные медиа для отправки в телеграм, собранные в виде массива
   */
  get arrayMediaToTelegram() {
    const re: MediaToTelegram[] = [];
    this.mediaToTelegram.forEach((value) => re.push(value));
    return re;
  }

  toggleEnabledSendHolidayName = () => {
    this.enableSendHolidayName = !this.enableSendHolidayName;
  };

  /**
   * Изменить форум
   */
  setSelectedForum = ({ description, url }: MediaForum) => {
    if (!this.selectedForum || url !== this.selectedForum.url) {
      this.selectedForum = { description, url };
    }
  };

  clearTopicPages = () => {
    this.topicPages.next = false;
    this.topicPages.prev = false;
  };

  setTopicPagesData = ({ next, prev, current }: HasPrevNextPage) => {
    this.topicPages.next = next;
    this.topicPages.prev = prev;
    this.topicPages.current = current;
  };

  setSelectedTopic = (topic: { href: string; name: string }) => {
    const { href, name } = topic;
    this.selectedTopic.href = href;
    this.selectedTopic.name = name;
  };

  toggleSendTitleMedia = () => {
    this.sendTitleMedia = !this.sendTitleMedia;
  };
}
