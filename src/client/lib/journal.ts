import { StatusFile } from '@client/mobxStore/fileStatus';

export function getTextStatus(status: StatusFile): string {
  let textStatus = '';
  if (status === StatusFile.ERROR) {
    textStatus = 'Ошибка';
  }
  if (status === StatusFile.LOADED) {
    textStatus = 'Файл загружен';
  }
  if (status === StatusFile.LOADING) {
    textStatus = 'Файл загружается';
  }
  if (status === StatusFile.TELEGRAM_SENDING) {
    textStatus = 'Отправляется в телеграм';
  }
  if (status === StatusFile.TELEGRAM_SEND) {
    textStatus = 'Отправлен в телеграм';
  }
  return textStatus;
}
