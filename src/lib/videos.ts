import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

import { FFMPEG_HIDE_LOG_CONSOLE } from '@/constants/ffmpeg';

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
