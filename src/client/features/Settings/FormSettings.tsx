import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';

import { useRootStore } from '@client/mobxStore/root';
import type { Settings } from '@/types/settings';
import styles from './FormSettings.module.css';
import RedditSettings from './RedditSettings';
import DefaultSavePath from './DefaultSavePath';
import TelegramBotSetting from './TelegramBotSetting';

export interface FormState extends Settings {
  redditPasswordConfirm: string;
}

const FormSettings: FC = () => {
  const {
    settingsStore: { uiSettings },
  } = useRootStore();

  const formSettings = useForm<FormState>({
    defaultValues: uiSettings,
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<FormState> = (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { redditPasswordConfirm, ...dataSettings } = data;
    window.electron.ipcRenderer.settingsSave(dataSettings);
    window.electron.ipcRenderer.getSettings();
  };

  return (
    <FormProvider {...formSettings}>
      <form onBlur={formSettings.handleSubmit(onSubmit)} className={styles.component}>
        <RedditSettings />
        <DefaultSavePath />
        <TelegramBotSetting />
      </form>
    </FormProvider>
  );
};

export default observer(FormSettings);
