import type { FC } from 'react';
import { useEffect } from 'react';
import { Button, FormGroup, InputGroup } from '@blueprintjs/core';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import { VIDEO_SOURCES } from '@/constants/videoSrc';

import styles from './InputVideoUrl.module.css';
import { getVideoSource } from '@/lib/videoCommon';
import ButtonCancel from './ButtonCancel';

interface Inputs {
  url: string;
}

interface Props {
  details: boolean;
  // eslint-disable-next-line no-unused-vars
  onEnterUrl: (url: string) => void;
}

const { ipcRenderer } = window.electron;

const validateUrl = (url: string): boolean => !!getVideoSource(url);

const supportedHosting = Array.from(VIDEO_SOURCES.keys()).join();

const InputVideoUrl: FC<Props> = ({ details, onEnterUrl }) => {
  const {
    uiState: { setAppBusy },
  } = useRootStore();

  const formSettings = useForm<Inputs>();

  useEffect(() => {
    formSettings.setFocus('url');
  }, []);

  useEffect(() => {
    ipcRenderer.onBackendBusy((_, value) => {
      setAppBusy(value);
    });
  }, []);

  /**
   * Отправить URL для анализа
   */
  const onSubmit: SubmitHandler<Inputs> = (data) => onEnterUrl(data.url);

  return (
    <FormProvider {...formSettings}>
      <form onSubmit={formSettings.handleSubmit(onSubmit)}>
        <Controller
          name="url"
          control={formSettings.control}
          defaultValue=""
          rules={{ required: true, validate: validateUrl }}
          render={({ field: { ref, ...props } }) => (
            <FormGroup
              label="Адрес видео"
              labelInfo="(*)"
              helperText={`Поддерживаемые хостинги: ${supportedHosting}`}
              intent={formSettings.formState.errors.url ? 'danger' : 'primary'}
              disabled={details}>
              <InputGroup placeholder="Ссылка" inputRef={ref} disabled={details} {...props} />
            </FormGroup>
          )}
        />
        <div className={styles.toolbar}>
          <Button type="submit" disabled={details} intent="primary">
            Загрузить
          </Button>
          <ButtonCancel onEnterUrl={onEnterUrl} />
        </div>
      </form>
    </FormProvider>
  );
};

export default observer(InputVideoUrl);
