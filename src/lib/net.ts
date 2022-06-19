import { net } from 'electron';

import { getMimeType } from './images';

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
