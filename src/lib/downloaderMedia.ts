/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';
import { resolve, parse } from 'path';
import { unlink, mkdir } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import https from 'https';
import type Store from 'electron-store';
import type { WebContents } from 'electron';
import { net } from 'electron';
import ytdl from 'ytdl-core';

import { AppSignals } from '@/constants/signals';
import type { Settings } from '@/types/settings';
import type {
  DownloadState,
  FormDataSelectChapters,
  ParamsSenderAddDownload,
  SelectChapter,
} from '@/types/downloader';
import { checkFileName, checkIfExistFile, createFullFileName } from './files';
import { PROGRESS_INTERVAL_MS, TypeMedia } from '@/constants/media';
import { StatusFile } from '@/client/mobxStore/fileStatus';
import {
  FFMPEG_AUDIO,
  FFMPEG_MERGE_VIDEO_AUDIO,
  FFMPEG_HIDE_LOG_CONSOLE,
} from '@/constants/ffmpeg';
import { ffmpegSplitMedia } from './videos';

interface FullDownloadInfoParts extends SelectChapter {
  to: number | undefined;
  numberPart: string;
}

/**
 * Для удобства использования for...of
 * Вычислить параметр "заканчивается на ..." у части
 */
function prepareChaptersToDownload({
  selectAll,
  selectedChapters,
}: {
  selectAll: boolean;
  selectedChapters: SelectChapter[];
}): Array<FullDownloadInfoParts> {
  const { length } = selectedChapters;
  const countDigits = String(Math.abs(length)).length;

  return selectedChapters.map((ch, currentIndex) => {
    const numberPart = `${currentIndex + 1}`.padStart(countDigits, '0');
    return {
      ...ch,
      to:
        currentIndex === length - 1
          ? undefined
          : selectedChapters[currentIndex + 1].start_time - 1 - ch.start_time,
      select: selectAll ? true : ch.select,
      numberPart,
    };
  });
}

export class DownloaderMedia {
  private currentDownload: Map<string, DownloadState> = new Map();

  private abortedDownloads: Set<string> = new Set();

  // eslint-disable-next-line no-unused-vars
  constructor(private store: Store<Settings>) {}

  addDownload = (params: ParamsSenderAddDownload) => {
    if (params.idVideoSource === 'www.youtube.com') {
      return this.runDownloadYouTube(params);
    }
    return this.runCommonDownload(params);
  };

  /**
   * Начать загрузку из ютуб:
   * Сгенерировать имя файла, запустить скачивание
   */
  runDownloadYouTube = (params: ParamsSenderAddDownload) => {
    const {
      media,
      permalink,
      subtitle,
      subtitleLanguageCode,
      subtitleType,
      title,
      eventSender,
      idVideoSource,
      runAfterWork,
      itagQuality = [],
    } = params;
    const idDownload = randomUUID();
    const savePath = this.store.get('defaultSavePath');
    // Сформировать полное имя файла
    let fileName = checkFileName(title);
    let ext = '';
    if (media === TypeMedia.video) {
      ext = '.mkv';
    }
    if (media === TypeMedia.audio) {
      ext = '.mp3';
    }
    if (subtitle && subtitleType && subtitleLanguageCode) {
      ext = `.${subtitleType}`;
      fileName += `_${subtitleLanguageCode}`;
    }
    // Получить имя файла
    fileName = checkIfExistFile({ ext, fileName, savePath });
    // Полное имя файла
    const fullFileName = resolve(savePath, `${fileName}`);
    eventSender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idDownload,
      idMedia: permalink,
      title,
      status: StatusFile.LOADING,
      description: fullFileName,
    });
    const youTubeUrl = `https://${idVideoSource}${permalink}`;
    // Скачать видео
    if (media === TypeMedia.video) {
      this.currentDownload.set(idDownload, {
        media,
        audio: { downloaded: 0, total: Infinity },
        video: { downloaded: 0, total: Infinity },
      });
      return this.youTubeVideoDownload({
        fullFileName,
        youTubeUrl,
        idDownload,
        eventSender,
        runAfterWork,
        itagQuality,
      });
    }
    // Скачать звук
    if (media === TypeMedia.audio) {
      this.currentDownload.set(idDownload, {
        media,
        audio: { downloaded: 0, total: Infinity },
      });
      return this.youTubeAudioDownload({
        fullFileName,
        youTubeUrl,
        idDownload,
        eventSender,
        runAfterWork,
      });
    }
    // Скачать субтитры
    if (media === TypeMedia.subtitle) {
      this.currentDownload.set(idDownload, {
        media,
        subtitle: { downloaded: 0, total: Infinity },
      });
      /**
       * Скачивание субтитров
       */
      return this.createGetRequest({
        eventSender,
        fileNameToSave: fullFileName,
        idDownload,
        url: subtitle,
        type: 'subtitle',
      });
    }

    return undefined;
  };

  /**
   * Скачивание ютуб-видео
   */
  private youTubeVideoDownload = (params: {
    fullFileName: string;
    youTubeUrl: string;
    idDownload: string;
    eventSender: WebContents;
    // eslint-disable-next-line no-unused-vars
    runAfterWork?: (fullFileName: string) => void;
    itagQuality: number[];
  }) => {
    const { fullFileName, youTubeUrl, idDownload, eventSender, runAfterWork, itagQuality } = params;
    // Создать потоки загрузки
    const audio = ytdl(youTubeUrl, { quality: 'highestaudio' }).on(
      'progress',
      (_, downloaded, total) => {
        const tracker = this.currentDownload.get(idDownload);
        tracker.audio = { downloaded, total };
      },
    );
    const video = ytdl(youTubeUrl, { quality: itagQuality }).on(
      'progress',
      (_, downloaded, total) => {
        const tracker = this.currentDownload.get(idDownload);
        tracker.video = { downloaded, total };
      },
    );

    const ffmpegProcess = this.createFfmpegProcess({
      fullFileName,
      idDownload,
      webContents: eventSender,
      runAfterWork,
    });

    const tracker = this.currentDownload.get(idDownload);
    tracker.intervalId = setInterval(this.sendDownloadProgress, PROGRESS_INTERVAL_MS, {
      idDownload,
      webContents: eventSender,
    });

    // Отправить потоки audio и video в ffmpeg
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audio.pipe((ffmpegProcess as any).stdio[4]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    video.pipe((ffmpegProcess as any).stdio[5]);

    // Запомнить потоки и процесс (если пользователь захочет отменить, то через эти переменные будет удобно сделать)
    tracker.youTubeAudioStream = audio;
    tracker.youTubeVideoStream = video;
    tracker.ffmpegProcess = ffmpegProcess;
  };

  /**
   * Скачивание ютуб-audio
   */
  private youTubeAudioDownload = (params: {
    fullFileName: string;
    youTubeUrl: string;
    idDownload: string;
    eventSender: WebContents;
    // eslint-disable-next-line no-unused-vars
    runAfterWork?: (fullFileName: string) => void;
  }) => {
    const { fullFileName, youTubeUrl, idDownload, eventSender, runAfterWork } = params;
    // Создать поток загрузки
    const audio = ytdl(youTubeUrl, { quality: 'highestaudio' }).on(
      'progress',
      (_, downloaded, total) => {
        const tracker = this.currentDownload.get(idDownload);
        tracker.audio = { downloaded, total };
      },
    );

    const ffmpegProcess = this.createFfmpegProcess({
      fullFileName,
      idDownload,
      webContents: eventSender,
      onlyAudio: true,
      runAfterWork,
    });

    const tracker = this.currentDownload.get(idDownload);
    tracker.intervalId = setInterval(this.sendDownloadProgress, PROGRESS_INTERVAL_MS, {
      idDownload,
      webContents: eventSender,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audio.pipe((ffmpegProcess as any).stdio[4]);

    // Запомнить поток и процесс (если пользователь захочет отменить, то через эти переменные будет удобно сделать)
    tracker.ffmpegProcess = ffmpegProcess;
    tracker.youTubeAudioStream = audio;
  };

  /**
   * Отправка в UI прогресса скачивания
   */
  private sendDownloadProgress = ({
    idDownload,
    webContents,
  }: {
    idDownload: string;
    webContents: WebContents;
  }) => {
    const tracker = this.currentDownload.get(idDownload);
    if (tracker) {
      const { audio, picture, subtitle, video } = tracker;
      webContents.send(AppSignals.DOWNLOAD_PROGRESS, {
        id: idDownload,
        progress: { audio, picture, subtitle, video },
      });
    }
  };

  /**
   * Создать процесс ffmpeg для обработки видео и аудио-потоков
   */
  private createFfmpegProcess(params: {
    idDownload: string;
    fullFileName: string;
    webContents: WebContents;
    /**
     * Если true, значит работать только с одним потоком- аудио
     */
    onlyAudio?: boolean;
    // eslint-disable-next-line no-unused-vars
    runAfterWork?: (fullFileName: string) => void;
  }) {
    const { fullFileName, idDownload, webContents, onlyAudio, runAfterWork } = params;
    const ffmpegParams = !onlyAudio
      ? [...FFMPEG_HIDE_LOG_CONSOLE, ...FFMPEG_MERGE_VIDEO_AUDIO]
      : [...FFMPEG_HIDE_LOG_CONSOLE, ...FFMPEG_AUDIO];
    ffmpegParams.push(fullFileName);
    const ffmpegProcess = spawn('ffmpeg', ffmpegParams, {
      windowsHide: true,
      stdio: !onlyAudio
        ? [
            /* Standard: stdin, stdout, stderr */
            'inherit',
            'inherit',
            'inherit',
            /* Custom: pipe:3, pipe:4, pipe:5 */
            'pipe',
            'pipe',
            'pipe',
          ]
        : [
            /* Standard: stdin, stdout, stderr */
            'inherit',
            'inherit',
            'inherit',
            /* Custom: pipe:3, pipe:4 */
            'pipe',
            'pipe',
          ],
    });
    ffmpegProcess.on('close', () => {
      this.onEndProcess({ idDownload, webContents });
      if (runAfterWork && !this.abortedDownloads.has(idDownload)) {
        runAfterWork(fullFileName);
      }
    });
    ffmpegProcess.on('error', (error) => {
      this.onErrorProcess({ error, idDownload, webContents });
    });
    return ffmpegProcess;
  }

  /**
   * Действия по окончанию процесса:
   * Прекратить циклично отправлять статистику, отправить в рендер сигнал "Финиш"
   */
  private onEndProcess = (params: { idDownload: string; webContents: WebContents }) => {
    const { idDownload, webContents } = params;
    const tracker = this.currentDownload.get(idDownload);
    if (!tracker) return undefined;
    if (tracker.intervalId) clearInterval(tracker.intervalId as ReturnType<typeof setInterval>);
    this.currentDownload.delete(idDownload);
    webContents.send(AppSignals.DOWNLOAD_FINISH, {
      id: idDownload,
    });
    return undefined;
  };

  /**
   * Обработчик ошибки
   */
  private onErrorProcess = (params: {
    idDownload: string;
    webContents: WebContents;
    error: Error;
  }) => {
    const { idDownload, webContents, error } = params;
    const tracker = this.currentDownload.get(idDownload);
    if (tracker.intervalId) clearInterval(tracker.intervalId as ReturnType<typeof setInterval>);
    this.currentDownload.delete(idDownload);
    webContents.send(AppSignals.DOWNLOAD_ERROR, {
      id: idDownload,
      error,
    });
  };

  downloadCancel = (id: string) => {
    const download = this.currentDownload.get(id);
    if (!download) return undefined;
    const {
      youTubeVideoStream,
      youTubeAudioStream,
      ffmpegProcess,
      request,
      intervalId,
      requestAudio,
    } = download;

    if (intervalId) {
      clearInterval(intervalId as ReturnType<typeof setInterval>);
    }
    if (youTubeVideoStream) {
      youTubeVideoStream.unpipe();
      youTubeVideoStream.destroy();
    }
    if (youTubeAudioStream) {
      youTubeAudioStream.unpipe();
      youTubeAudioStream.destroy();
    }
    if (ffmpegProcess) {
      ffmpegProcess.kill('SIGINT');
    }
    if (request) {
      request.abort();
    }
    if (requestAudio) {
      requestAudio.abort();
    }
    this.currentDownload.delete(id);
    this.abortedDownloads.add(id);

    return undefined;
  };

  /**
   * Запуск скачивания в общих случаях
   */
  runCommonDownload = (params: ParamsSenderAddDownload) => {
    const { title, eventSender, url, urlAudio } = params;

    const idDownload = randomUUID();
    eventSender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idDownload,
      title,
      status: StatusFile.LOADING,
      description: '',
    });
    const savePath = this.store.get('defaultSavePath');
    // Получить имя файла
    const fileNameToSave = createFullFileName({ savePath, title, url, urlAudio });

    if (!urlAudio) {
      this.currentDownload.set(idDownload, {
        media: TypeMedia.video,
        video: { downloaded: 0, total: Infinity },
      });
      return this.createGetRequest({ eventSender, fileNameToSave, idDownload, url, type: 'video' });
    }

    this.currentDownload.set(idDownload, {
      media: TypeMedia.video,
      video: { downloaded: 0, total: Infinity },
      audio: { downloaded: 0, total: Infinity },
    });

    return this.createGetMergeVideoAudioRequest({
      eventSender,
      fileNameToSave,
      idDownload,
      url,
      urlAudio,
    });
  };

  /**
   * Создать запрос на скачивание ресурса с одним урлом
   */
  private createGetRequest = (params: {
    fileNameToSave: string;
    url: string;
    idDownload: string;
    eventSender: WebContents;
    type: 'subtitle' | 'audio' | 'video';
  }) => {
    const { fileNameToSave, url, idDownload, eventSender, type } = params;
    const tracker = this.currentDownload.get(idDownload);

    const request = net.request({ url });
    request.on('response', (response) => {
      tracker[type].total = parseInt(response.headers['content-length'] as string, 10);
      const stream = createWriteStream(fileNameToSave);

      tracker.intervalId = setInterval(this.sendDownloadProgress, PROGRESS_INTERVAL_MS, {
        idDownload,
        webContents: eventSender,
      });

      response.on('error', (error) => {
        this.onErrorProcess({ error, idDownload, webContents: eventSender });
        // Удалить файл и если будет ошибка, то не нужно на неё смотреть
        // eslint-disable-next-line no-console
        unlink(fileNameToSave).catch((e) => console.error(e));
      });
      response.on('end', () => {
        stream.close();
        this.onEndProcess({ idDownload, webContents: eventSender });
      });
      response.on('data', (chunk) => {
        tracker[type].downloaded += chunk.length;
        stream.write(chunk);
      });
    });
    if (!tracker.intervalId) {
      tracker.intervalId = setInterval(this.sendDownloadProgress, PROGRESS_INTERVAL_MS, {
        idDownload,
        webContents: eventSender,
      });
    }
    // Запомнить request (если пользователь захочет отменить, то через эту переменную будет удобно сделать)
    tracker.request = request;
    request.end();
  };

  /**
   * Создать запрос на скачивание ресурса с двумя адресами (видео и аудио)
   */
  private createGetMergeVideoAudioRequest = (params: {
    fileNameToSave: string;
    url: string;
    urlAudio: string;
    idDownload: string;
    eventSender: WebContents;
  }) => {
    const { fileNameToSave, url, idDownload, eventSender, urlAudio } = params;
    const tracker = this.currentDownload.get(idDownload);

    // Создать команду на слияние видео и аудио
    const ffmpegProcess = this.createFfmpegProcess({
      fullFileName: fileNameToSave,
      idDownload,
      webContents: eventSender,
    });

    // Сделать поток скачивания видео-ресурса
    this.createRequestToFfmpeg({
      typeMediaStream: 'video',
      eventSender,
      ffmpegProcess,
      fileNameToSave,
      idDownload,
      url,
    });

    // Сделать поток скачивания аудио-ресурса
    this.createRequestToFfmpeg({
      typeMediaStream: 'audio',
      eventSender,
      ffmpegProcess,
      fileNameToSave,
      idDownload,
      url: urlAudio,
    });

    tracker.intervalId = setInterval(this.sendDownloadProgress, PROGRESS_INTERVAL_MS, {
      idDownload,
      webContents: eventSender,
    });
    tracker.ffmpegProcess = ffmpegProcess;
  };

  /**
   * Создаёт запрос к урлу,
   * затем перенаправляет его в ffmpeg,
   * следит за ошибками в запросе, заполняет статистику скачивания
   */
  private createRequestToFfmpeg = (params: {
    url: string;
    ffmpegProcess: ChildProcess;
    idDownload: string;
    eventSender: WebContents;
    fileNameToSave: string;
    typeMediaStream: 'video' | 'audio';
  }) => {
    const { ffmpegProcess, url, idDownload, eventSender, fileNameToSave, typeMediaStream } = params;
    const tracker = this.currentDownload.get(idDownload);
    // Создать видеопоток
    const mediaRequest = https.get(url, (res) => {
      // Перенаправить видеопоток в процесс ffmpeg
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.pipe((ffmpegProcess as any).stdio[typeMediaStream === 'video' ? 5 : 4]);
    });
    // Только так можно получить размер скачиваемого файла
    mediaRequest.on('response', (response) => {
      tracker[typeMediaStream].total = parseInt(response.headers['content-length'] as string, 10);
      // Когда придут данные, запомнить их объём
      response.on('data', (chunk) => {
        tracker[typeMediaStream].downloaded += chunk.length;
      });
    });
    mediaRequest.on('error', (error) => {
      this.onErrorProcess({ error, idDownload, webContents: eventSender });
      // Удалить файл и если будет ошибка, то не нужно на неё смотреть
      // eslint-disable-next-line no-console
      unlink(fileNameToSave).catch((e) => console.error(e));
    });
    if (typeMediaStream === 'video') {
      tracker.request = mediaRequest;
    } else {
      tracker.requestAudio = mediaRequest;
    }
  };

  /**
   * Скачать медиа и разделить оное по частям
   */
  downloadChapters = async ({
    eventSender,
    id,
    title,
    settings: { onlyAudio, selectAll, selectedChapters, deleteSourceAfterWork },
  }: {
    settings: FormDataSelectChapters;
    id: string;
    eventSender: WebContents;
    title: string;
  }) => {
    // Подготовить массив данных для скачивания
    const downloadChapters = prepareChaptersToDownload({ selectAll, selectedChapters });

    // Подготовка действий после скачивания файла
    const runAfterWork = async (fullFileName: string) => {
      await this.splitFileToChapters({
        fullFileName,
        downloadChapters,
        onlyAudio,
        eventSender,
        title,
      });
      if (deleteSourceAfterWork) {
        unlink(fullFileName).catch(() => undefined);
      }
    };

    this.runDownloadYouTube({
      eventSender,
      idVideoSource: 'www.youtube.com',
      media: onlyAudio ? TypeMedia.audio : TypeMedia.video,
      title,
      permalink: `/watch?v=${id}`,
      url: '',
      runAfterWork,
    });
  };

  /**
   * Разделяет файл по частям
   */
  splitFileToChapters = async ({
    downloadChapters,
    fullFileName,
    onlyAudio,
    title,
    eventSender,
  }: {
    fullFileName: string;
    onlyAudio: boolean;
    downloadChapters: FullDownloadInfoParts[];
    title: string;
    eventSender: WebContents;
  }) => {
    const idDownload = randomUUID();
    eventSender.send(AppSignals.JOURNAL_ADD_RECORD, {
      id: idDownload,
      idMedia: fullFileName,
      title,
      status: StatusFile.LOADING,
      description: fullFileName,
      disableDelete: true,
    });

    // Создать каталог сохранения
    const { dir, base, ext, name } = parse(fullFileName);
    const pathDir = resolve(dir, `${base}`.replace(ext, ''));
    if (!existsSync(pathDir)) await mkdir(pathDir);
    let downloaded = 0;

    const progress = onlyAudio
      ? { audio: { downloaded, total: downloadChapters.length } }
      : { video: { downloaded, total: downloadChapters.length } };
    eventSender.send(AppSignals.DOWNLOAD_PROGRESS, {
      id: idDownload,
      progress,
    });

    // Пройтись по заголовкам, разбить медиа-файл
    for (const chapter of downloadChapters) {
      const { start_time, to, select, title: titleChapter, numberPart } = chapter;
      // Составить имя файла
      if (select) {
        const targetFullFileName = resolve(
          dir,
          name,
          `${numberPart}_${titleChapter}.${onlyAudio ? '.mp3' : '.mp4'}`,
        );
        try {
          // eslint-disable-next-line no-await-in-loop
          await ffmpegSplitMedia({
            isAudio: onlyAudio,
            sourceFullFileName: fullFileName,
            start_time,
            to,
            targetFullFileName,
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }
      downloaded += 1;
      progress[onlyAudio ? 'audio' : 'video'] = { downloaded, total: downloadChapters.length };
      eventSender.send(AppSignals.DOWNLOAD_PROGRESS, {
        id: idDownload,
        progress,
      });
    }
    this.currentDownload.delete(idDownload);
    eventSender.send(AppSignals.DOWNLOAD_FINISH, {
      id: idDownload,
    });
  };
}
