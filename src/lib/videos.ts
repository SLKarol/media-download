import { exec, spawn } from 'child_process';
import path from 'path';
import { finished } from 'stream/promises';
import { createWriteStream } from 'fs';
import { copyFile, rm } from 'fs/promises';

import util from 'util';
import axios from 'axios';
import { app } from 'electron';

import { deleteFileIfExist } from './files';
import { FFMPEG_HIDE_LOG_CONSOLE } from '@/constants/ffmpeg';

const execP = util.promisify(exec);

/**
 * Скачать медиа-файл, вернуть полное имя скаченного файла
 */
async function downloadFile(props: {
  url?: string;
  fileName: string;
  savePath: string;
  audio: boolean;
}): Promise<string | null> {
  const { url, fileName, savePath, audio } = props;
  if (!url) return null;
  // Если скачивать аудио, то вместо расширения mp4 дать расширение mp3
  const saveFileName = !audio ? fileName : `${fileName.slice(0, -1)}3`;
  const target = path.resolve(savePath, saveFileName);
  const writer = createWriteStream(target);
  return axios({ url, method: 'GET', responseType: 'stream' })
    .then((response) => {
      response.data.pipe(writer);
      return finished(writer);
    })
    .then(() => saveFileName)
    .catch(() => {
      writer.close();
      rm(target);
      return null;
    });
}

// todo : remove this
export async function downloadMedia(props: {
  url: string;
  urlAudio?: string;
  fileName: string;
  savePath: string;
  idRecord: string;
}): Promise<{ error: string; fullFileName: string }> {
  const { fileName, savePath, url, urlAudio, idRecord } = props;
  const tmpPath = app.getPath('temp');
  // Почистить мусор от возможных предыдущих скачиваний
  const mp3FileName = `${fileName.slice(0, -1)}3`;
  await Promise.all([
    deleteFileIfExist(path.resolve(tmpPath, fileName)),
    deleteFileIfExist(path.resolve(tmpPath, mp3FileName)),
  ]);

  // Скачать видео, аудио(если есть), удалить временный файл (если есть)
  const loadedFiles = await Promise.all([
    downloadFile({ audio: false, fileName, savePath: tmpPath, url }),
    // Аудио возможно не существует, поэтому вместо ошибки просто вернуть пустую строку
    downloadFile({ audio: true, fileName, savePath: tmpPath, url: urlAudio }).catch(() => null),
    deleteFileIfExist(path.resolve(tmpPath, `${idRecord}.mp4`)),
  ]);
  const [videoFile, audioFile] = loadedFiles;
  //  Если нет аудио, значит нужно из TMP перенести видео

  if (!audioFile) {
    await copyFile(path.resolve(tmpPath, videoFile), path.resolve(savePath, videoFile));
    await rm(path.resolve(tmpPath, videoFile));
    return { error: '', fullFileName: path.resolve(savePath, videoFile) };
  }
  // Составить команду для склеивания видео и аудио во временный файл
  const command = `ffmpeg -loglevel error -i "${path.resolve(
    tmpPath,
    videoFile,
  )}" -i "${path.resolve(tmpPath, audioFile)}" -c:v copy -c:a aac "${path.resolve(
    tmpPath,
    `${idRecord}.mp4`,
  )}"`;

  // Выполнить команду и получить вывод ошибок (если таковые есть)
  const { stderr } = await execP(command);

  // Удалить промежуточные файлы
  await Promise.all([
    deleteFileIfExist(path.resolve(tmpPath, videoFile)),
    audioFile && deleteFileIfExist(path.resolve(tmpPath, audioFile)),
  ]);

  if (!stderr) {
    await copyFile(path.resolve(tmpPath, `${idRecord}.mp4`), path.resolve(savePath, videoFile));
    await rm(path.resolve(tmpPath, `${idRecord}.mp4`));
  }

  return { error: stderr, fullFileName: path.resolve(savePath, videoFile) };
}

export function ffmpegSplitMedia(options: {
  sourceFullFileName: string;
  targetFullFileName: string;
  start_time: number;
  to: number | undefined;
  isAudio: boolean;
}) {
  const { sourceFullFileName, targetFullFileName, to, start_time: startTime, isAudio } = options;
  // Составление массива параметров
  const ffmpegParams = [
    ...FFMPEG_HIDE_LOG_CONSOLE,
    '-i',
    sourceFullFileName,
    '-ss',
    `${startTime}`,
  ];
  if (to) {
    ffmpegParams.push('-t', `${to}`);
  }
  // Настройка выходного кодека, потока
  ffmpegParams.push('-c', 'copy', '-f', isAudio ? 'mp3' : 'nut', 'pipe:4');
  return new Promise(function Split(resolve, reject) {
    const ffmpegProcess = spawn('ffmpeg', ffmpegParams, {
      // windowsHide: true,
      stdio: [
        /* Standard: stdin, stdout, stderr */
        'inherit',
        'inherit',
        'inherit',
        /* Custom: pipe:3, pipe:4 */
        'pipe',
        'pipe',
      ],
    });
    ffmpegProcess.on('close', (value) => {
      resolve(value);
    });
    ffmpegProcess.on('error', (error) => {
      // this.onErrorProcess({ error, idDownload, webContents });
      reject(error);
    });
    ffmpegProcess.stdio[4].pipe(createWriteStream(targetFullFileName));
  });
}
