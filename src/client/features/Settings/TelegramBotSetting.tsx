import type { FC } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormGroup, Card, H5, InputGroup, Elevation } from '@blueprintjs/core';

import type { FormState } from './FormSettings';

import styles from './TelegramBotSetting.module.css';

const TelegramBotSetting: FC = () => {
  const { control } = useFormContext<FormState>();

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
              label="ID телеграмм-групп, в которые можно делать рассылку. Сперва будет разослано в первую группу, затем в остальные"
              helperText="Список групп через запятую">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
    </Card>
  );
};

export default TelegramBotSetting;
