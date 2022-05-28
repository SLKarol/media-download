import { extname, resolve } from 'path';
import { existsSync } from 'fs';
import { rm, writeFile } from 'fs/promises';

const DENIED_NAMES = [
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
];

/**
 * Заменить запрещённые символы на _
 */
export function checkFileName(value: string): string {
  if (DENIED_NAMES.some((n) => n === value)) return '_';
  return value.replace(/[/\\?%*:|"<>]/g, '_');
}

/**
 * Если файл существует, дописывает к нему _2 и т.д.
 */
function checkIfExistFile(props: { savePath: string; fileName: string; ext: string }) {
  const { ext, fileName, savePath } = props;
  let i = 0;
  let fullFileName = resolve(savePath, `${fileName}${ext}`);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!existsSync(fullFileName)) break;
    i += 1;
    fullFileName = resolve(savePath, `${fileName}_${i}${ext}`);
  }
  return i === 0 ? `${fileName}${ext}` : `${fileName}_${i}${ext}`;
}

export function createFullFileName(props: {
  title: string;
  url: string;
  urlAudio?: string | undefined;
  savePath: string;
}) {
  const { savePath, title, urlAudio = undefined, url } = props;

  const fileName = checkFileName(title);
  // Получить расширение файла
  let ext = extname(url);
  const idxQ = ext.indexOf('?');
  if (idxQ > -1) {
    ext = ext.substring(0, idxQ);
  }
  // Если есть urlAudio, значит придётся склеивать с видео, будет mp4
  if (urlAudio) {
    ext = '.mp4';
  }

  return checkIfExistFile({ ext, fileName, savePath });
}

/**
 * Удалить файл, если он существует
 */
export async function deleteFileIfExist(fullName: string): Promise<void> {
  if (existsSync(fullName)) {
    await rm(fullName);
  }
  return undefined;
}

export function saveBase64ToFile({
  data,
  fileName,
  savePath,
}: {
  fileName: string;
  data: string;
  savePath: string;
}): Promise<{ error: string; fullFileName: string }> {
  const fullFileName = resolve(savePath, fileName);
  // Remove header
  const base64Data = data.split(';base64,').pop();
  return writeFile(fullFileName, base64Data, { encoding: 'base64' })
    .then(() => ({
      error: '',
      fullFileName,
    }))
    .catch((e) => ({ error: JSON.stringify(e), fullFileName }));
}
