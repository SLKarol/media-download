import { VIDEO_SOURCES } from '@/constants/videoSrc';

// ! Эти функции одинаково работают и в nodejs и в render.
// ! Поэтому сюда не нужно затаскивать специфичные для nodejs  зависимости

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
