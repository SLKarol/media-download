import { VIDEO_SOURCES } from '@/constants/videoSrc';

/**
 * По урлу выдаёт ID видео источника
 */
export function getVideoSource(url: string) {
  let id = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const [idSource, source] of VIDEO_SOURCES) {
    const testReg = source.pattern.test(url);
    if (testReg) {
      id = idSource;
      break;
    }
  }
  return id;
}
