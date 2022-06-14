import { net } from 'electron';

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
