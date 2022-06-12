import type { FC } from 'react';
import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormGroup, Card, H5, InputGroup, Button, Intent, Elevation } from '@blueprintjs/core';

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
          const fp = { label: 'Имя пользователя в Reddit' };
          return (
            <FormGroup {...fp}>
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
          const fp = { label: 'Пароль пользователя в Reddit' };
          return (
            <FormGroup {...fp}>
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
          const fp = {
            label: 'Подтвердите пароль',
            intent,
          };
          return (
            <FormGroup {...fp}>
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
          const fp = {
            label: 'App Id',
          };
          return (
            <FormGroup {...fp}>
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
          const fp = {
            label: 'Reddit api secret',
          };
          return (
            <FormGroup {...fp}>
              <InputGroup inputRef={ref} {...p} />
            </FormGroup>
          );
        }}
      />
    </Card>
  );
};

export default RedditSettings;
