import { StatusJournal } from '@client/mobxStore/journal';

export function getTextStatus(status: StatusJournal): string {
  let textStatus = '';
  if (status === StatusJournal.ERROR) {
    textStatus = 'Ошибка';
  }
  if (status === StatusJournal.LOADED) {
    textStatus = 'Файл загружен';
  }
  if (status === StatusJournal.LOADING) {
    textStatus = 'Файл загружается';
  }
  if (status === StatusJournal.TELEGRAM_SENDING) {
    textStatus = 'Отправляется в телеграм';
  }
  if (status === StatusJournal.TELEGRAM_SEND) {
    textStatus = 'Отправлен в телеграм';
  }
  return textStatus;
}
