import { extname } from 'path';
import type { IpcMainInvokeEvent } from 'electron';
import { Notification } from 'electron';
import log from 'electron-log';

import { StatusFile } from '@client/mobxStore/fileStatus';
import { AppSignals } from '@/constants/signals';
import { createFullFileName, saveBase64ToFile } from '@/lib/files';
import type { MediaAlbum } from '@/types/media';

/**
 * Сохранить картинку
 */
export async function downloadPicture(params: {
  param: {
    image: string;
    idRecord: string;
    title: string;
    url: string;
  };
  savePath: string;
  event: IpcMainInvokeEvent;
}) {
  const {
    savePath,
    param: { idRecord, image, title, url },
    event,
  } = params;

  // Отдать в статистику инфо, что скачивается файл
  event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
    id: idRecord,
    title,
    status: StatusFile.LOADING,
    description: '',
  });
  try {
    // Получить имя файла
    const fileName = createFullFileName({ savePath, title, url });

    // Скачать картинку, получить результат
    const result = { error: '', fullFileName: '' };

    const { error, fullFileName } = await saveBase64ToFile({ data: image, fileName, savePath });
    result.error = error;
    result.fullFileName = fullFileName;

    event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idRecord,
      title,
      status: result.error ? StatusFile.ERROR : StatusFile.LOADED,
      description: result.error || result.fullFileName,
    });

    // Результат отдать в статистику, пусть запишет
    new Notification({
      title,
      body: !result.error ? 'Файл скачен' : 'Ошибка при скачивании',
      silent: true,
    }).show();
  } catch (e) {
    new Notification({
      title,
      body: 'Ошибка при скачивании',
      silent: true,
    }).show();
    event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idRecord,
      status: StatusFile.ERROR,
      error: JSON.stringify(e),
    });
    event.sender.send(AppSignals.BACKEND_ERROR, e);
    log.error(e);
  }
}

/**
 * Сохраняет коллекцию на диске
 */
export async function downloadCollection({
  collection,
  idSource,
  title,
  savePath,
}: {
  collection: MediaAlbum;
  title: string;
  idSource: string;
  savePath: string;
}) {
  if (idSource !== 'www.reddit.com') return false;
  const values = Object.values(collection);
  const countDigits = String(Math.abs(values.length)).length;

  return values.map(({ data, url }, currentIndex) => {
    const numberPart = `${currentIndex + 1}`.padStart(countDigits, '0');
    let fileName = `${title}-${numberPart}`;
    let ext = extname(url);
    const idxQ = ext.indexOf('?');
    if (idxQ > -1) {
      ext = ext.substring(0, idxQ);
    }
    fileName += ext;
    return saveBase64ToFile({ data, fileName, savePath });
  });
}
