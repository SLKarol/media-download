const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function dateTimeToString(jsonDate: string): string {
  return dateTimeFormat.format(new Date(jsonDate));
}

/**
 * Форматирует секунды в человеческий формат
 */
export function formatSeconds(secNum: number): string {
  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor((secNum - hours * 3600) / 60);
  const seconds = secNum - hours * 3600 - minutes * 60;

  let re = '';
  if (hours > 0) {
    re = `${hours.toString(10).padStart(2, '0')}:`;
  }
  re += `${minutes.toString(10).padStart(2, '0')}:`;
  re += `${seconds.toString(10).padStart(2, '0')}`;
  return re;
}
