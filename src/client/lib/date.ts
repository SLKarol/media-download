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
