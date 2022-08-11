import type { FC } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormGroup, Card, H5, InputGroup, Elevation, NumericInput } from '@blueprintjs/core';

import type { FormStateSettings } from '@/types/settings';

import styles from './TelegramBotSetting.module.css';
import { HOLIDAY_NAME_PATTERN } from '@/constants/telegram';

const TelegramBotSetting: FC = () => {
  const { control, setValue } = useFormContext<FormStateSettings>();
  const holydayPattern = new RegExp(`\\${HOLIDAY_NAME_PATTERN}`);
  return (
    <Card elevation={Elevation.ONE} className={styles.marginTop}>
      <H5>Настройки Telegram-bot</H5>
      <Controller
        name="telegramToken"
        control={control}
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup label="Токен телеграм-бота">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="telegramAdmin"
        control={control}
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup label="ID телеграм-чата бота с админом. Сюда будут записываться картинки для отправки в альбомы.">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="telegramGropus"
        control={control}
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup
              label="ID телеграмм-групп, в которые можно делать рассылку."
              helperText="Список групп через запятую">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="waitMsWhenSendTelegram"
        control={control}
        rules={{ required: true }}
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup
              label="Пауза (ms) между отправками в телеграмм-группы."
              helperText="Чтобы телеграм не принял бота за спамера">
              <NumericInput
                inputRef={ref}
                onValueChange={(val) => setValue('waitMsWhenSendTelegram', val)}
                {...p}
              />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="descriptionHoliday"
        control={control}
        rules={{ pattern: holydayPattern }}
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup
              label="Шаблон текста о сегодняшнем празднике"
              helperText="Название праздника задаётся как $HOLYDAY">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
    </Card>
  );
};

export default TelegramBotSetting;
