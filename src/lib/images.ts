/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import { TYPES } from '../constants/mimeTypes';

/**
 * Вернуть MIME-тип по имени файла
 */
export function getMimeType(fileName: string): string {
  const ext = fileName.split('.')[1].toLowerCase();
  if (!ext) return '';
  return TYPES.get(ext);
}

function gcd(a: number, b: number) {
  if (b > a) {
    const temp = a;
    a = b;
    b = temp;
  }
  while (b != 0) {
    const m = a % b;
    a = b;
    b = m;
  }
  return a;
}

/**
 * Расчёт соотношений ширины и высоты
 * @param {number} width
 * @param {number} height
 * @returns {string} 4:2 или 4:9 и т.д.
 */
function calculateRatio(width: number, height: number) {
  const c = gcd(width, height);
  return `${width / c}:${height / c}`;
}

/**
 * Соотношение корректное для отправки в телеграмм?
 * @param {number} width
 * @param {number} height
 * @returns {boolean} Соотношение корректное для отправки в телеграмм?
 */
export const isCorrectRatio = (width: number, height: number) =>
  !calculateRatio(width, height)
    .split(':')
    .some((q) => +q >= 20);
