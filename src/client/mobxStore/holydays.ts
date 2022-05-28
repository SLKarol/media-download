import { makeAutoObservable } from 'mobx';

import { randomIntFromInterval } from '@/lib/utils';

import type { RootStore } from './root';

export class HolidaysStore {
  /**
   * Список праздников
   */
  holidays: Array<string> = [];

  /**
   * Индекс случайной записи
   */
  indxRandom = -1;

  // eslint-disable-next-line no-unused-vars
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  /**
   * Получить список праздников
   */
  loadHolydays = (values: string[]) => {
    this.holidays.length = 0;
    this.holidays = [...values];
    const max = this.holidays.length;
    this.indxRandom = max > 0 ? randomIntFromInterval(0, max - 1) : -1;
  };

  /**
   * Название выбранного праздника
   */
  get selectedHoliday() {
    return this.indxRandom > -1 ? this.holidays[this.indxRandom] : '';
  }

  changeRandomHolyday = () => {
    const max = this.holidays.length;
    this.indxRandom = max > 0 ? randomIntFromInterval(0, max - 1) : -1;
  };
}
