import type { IpcMainInvokeEvent } from 'electron';
import { Notification } from 'electron';

import { StatusJournal } from '@client/mobxStore/journal';
import { AppSignals } from '@/constants/signals';
import type { Reddit } from '@/lib/reddit';
import type { PropsDownLoadVideo, MediaSummaryPreview } from '@/types/media';
import { createFullFileName } from '@/lib/files';
import { downloadMedia } from '@/lib/videos';
import { getVideoSource } from '@/lib/videoCommon';
import { downloadYapPageInfo } from '@/lib/yaplakal';
import { downloadRedGifsInfo } from '@/lib/redgifs';
import { downloadImgurInfo } from '@/lib/imgur';

/**
 * Запрос инфы о видео
 */
export async function getVideoInfo(props: { url: string; reddit: Reddit }) {
  const { url, reddit } = props;
  const idVideoSource = getVideoSource(url);

  let info: MediaSummaryPreview;
  if (idVideoSource === 'www.reddit.com') {
    info = await reddit.getInfo({ urlReddit: url });
  }
  if (idVideoSource === 'www.yaplakal.com') {
    info = await downloadYapPageInfo(url);
  }
  if (idVideoSource === 'www.redgifs.com') {
    info = await downloadRedGifsInfo(url);
  }
  if (idVideoSource === 'imgur.com') {
    info = await downloadImgurInfo(url);
  }
  return info;
}

/**
 * Скачать видео по ссылкам
 */
export async function downloadVideo(props: {
  propsDownload: PropsDownLoadVideo;
  savePath: string;
  event: IpcMainInvokeEvent;
}) {
  const {
    savePath,
    propsDownload: { title, urlAudio, urlVideo, idRecord },
    event,
  } = props;

  // Отдать в статистику инфо, что скачивается файл
  event.sender.send(AppSignals.JOURNAL_ADD_RECORD, {
    id: idRecord,
    title,
    status: StatusJournal.LOADING,
    description: '',
  });
  try {
    // Получить имя файла
    const fileName = createFullFileName({ savePath, title, urlAudio, url: urlVideo });

    new Notification({
      title,
      body: 'Файл скачивается',
      silent: true,
    }).show();

    // Скачать видео, получить результат
    const result = await downloadMedia({ url: urlVideo, urlAudio, fileName, savePath, idRecord });

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
