import type { FC } from 'react';
import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  FormGroup,
  Card,
  H5,
  InputGroup,
  Button,
  Intent,
  Elevation,
  NumericInput,
} from '@blueprintjs/core';

import type { FormStateSettings } from '@/types/settings';

const { ipcRenderer } = window.electron;

const RedditSettings: FC = () => {
  const {
    control,
    setFocus,
    watch,
    formState: { errors },
  } = useFormContext<FormStateSettings>();

  useEffect(() => {
    setFocus('redditUserName');
  }, [setFocus]);

  const onClickRedditHelp = () => {
    ipcRenderer.openUrl('https://rymur.github.io/intro');
  };

  return (
    <Card elevation={Elevation.ONE}>
      <H5>Настройки Reddit</H5>
      <p>
        Прочитать о настройках reddit-app можно по ссылке:
        <Button icon="link" minimal onClick={onClickRedditHelp} />
      </p>
      <Controller
        name="redditUserName"
        control={control}
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup label="Имя пользователя в Reddit">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="redditPassword"
        control={control}
        defaultValue=""
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup label="Пароль пользователя в Reddit">
              <InputGroup inputRef={ref} type="password" {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="redditPasswordConfirm"
        control={control}
        defaultValue=""
        rules={{
          validate: (val: string) => {
            const password = watch('redditPassword');
            if (password && password !== val) return false;
            return true;
          },
        }}
        render={({ field: { ref, ...p } }) => {
          const intent = (errors.redditPasswordConfirm ? 'danger' : 'none') as Intent;
          return (
            <FormGroup label="Подтвердите пароль" intent={intent}>
              <InputGroup inputRef={ref} type="password" intent={intent} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="redditAppId"
        control={control}
        defaultValue=""
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup label="App Id">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="redditApiSecret"
        control={control}
        defaultValue=""
        render={({ field: { ref, ...p } }) => {
          return (
            <FormGroup label="Reddit api secret">
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
      <Controller
        name="redditLimitRecords"
        control={control}
        render={({ field: { ref, onChange, ...p } }) => {
          return (
            <FormGroup label="Количество запрашиваемых новых записей">
              <NumericInput inputRef={ref} min={1} onValueChange={onChange} {...p} />
            </FormGroup>
          );
        }}
      />
    </Card>
  );
};

export default RedditSettings;
