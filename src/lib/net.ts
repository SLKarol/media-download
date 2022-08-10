import { net } from 'electron';

import { getMimeType } from './images';

/**
 * Возвращает текстовое содержимое урла (html, json, etc)
 */
export function getTextContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request({ url, useSessionCookies: true });
    request.on('response', (response) => {
      const data: Buffer[] = [];
      response.on('data', (chunk) => data.push(chunk));
      response.on('error', (err) => reject(err));
      response.on('end', async () => {
        const buffer = Buffer.concat(data);
        const html = buffer.toString();
        resolve(html);
      });
    });
    request.end();
  });
}

/**
 * Скачать картинку и декодировать её в base64
 */
export function decodeImageUrlTo64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request({ url });
    request.on('response', (response) => {
      const data: Buffer[] = [];
      response.on('data', (chunk) => data.push(chunk));
      response.on('error', (err) => reject(err));
      response.on('end', async () => {
        const buffer = Buffer.concat(data);
        const sourceImageB64 = buffer.toString('base64');
        const fileNameSource = url.split('/').pop().split('?')[0];
        const mimeTypes = getMimeType(fileNameSource);
        resolve(`data:${mimeTypes};base64,${sourceImageB64}`);
      });
    });
    request.end();
  });
}

/**
 * Проверка: Существует ли такой урл?
 */
export function urlExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const request = net.request({ url });
    request.on('response', (response) => {
      response.on('error', () => resolve(false));
      resolve(response.statusCode === 200);
    });
    request.on('error', () => resolve(false));
    request.end();
  });
}
