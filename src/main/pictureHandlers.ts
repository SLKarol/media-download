import type { IpcMainInvokeEvent } from 'electron';
import { Notification } from 'electron';

import { StatusJournal } from '@client/mobxStore/journal';
import { AppSignals } from '@/constants/signals';
import { createFullFileName, saveBase64ToFile } from '@/lib/files';
import { downloadMedia } from '@/lib/videos';

/**
 * Скачать каритнку
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
    status: StatusJournal.LOADING,
    description: '',
  });
  try {
    // Получить имя файла
    const fileName = createFullFileName({ savePath, title, url });

    new Notification({
      title,
      body: 'Файл скачивается',
      silent: true,
    }).show();

    // Скачать картинку, получить результат
    const result = { error: '', fullFileName: '' };
    if (image) {
      const { error, fullFileName } = await saveBase64ToFile({ data: image, fileName, savePath });
      result.error = error;
      result.fullFileName = fullFileName;
    } else {
      const { error, fullFileName } = await downloadMedia({ url, fileName, savePath, idRecord });
      result.error = error;
      result.fullFileName = fullFileName;
    }

    event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idRecord,
      title,
      status: result.error ? StatusJournal.ERROR : StatusJournal.LOADED,
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
      status: StatusJournal.ERROR,
      error: JSON.stringify(e),
    });
  }
}