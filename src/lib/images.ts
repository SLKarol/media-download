import axios from 'axios';

import { TYPES } from '../constants/mimeTypes';

/**
 * Вернуть MIME-тип по имени файла
 */
export function getMimeType(fileName: string): string {
  const ext = fileName.split('.')[1].toLowerCase();
  if (!ext) return '';
  return TYPES.get(ext);
}

/**
 * Скачать картинку и декодировать её в base64
 */
export async function decodeImageUrlTo64(url: string) {
  const sourceImage = await axios.get(url, { responseType: 'arraybuffer' });
  const sourceImageB64 = Buffer.from(sourceImage.data).toString('base64');
  const fileNameSource = url.split('/').pop().split('?')[0];
  const mimeTypes = getMimeType(fileNameSource);
  return `data:${mimeTypes};base64,${sourceImageB64}`;
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

function gcd(a: number, b: number) {
  if (b > a) {
    let temp = a;
    a = b;
    b = temp;
  }
  while (b != 0) {
    let m = a % b;
    a = b;
    b = m;
  }
  return a;
}
