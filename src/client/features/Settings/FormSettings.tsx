import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { useForm, FormProvider } from 'react-hook-form';

import { useRootStore } from '@client/mobxStore/root';
import type { FormStateSettings } from '@/types/settings';
import styles from './FormSettings.module.css';
import RedditSettings from './RedditSettings';
import DefaultSavePath from './DefaultSavePath';
import TelegramBotSetting from './TelegramBotSetting';
import YaPlakal from './YaPlakal';
import { saveSettingsToConfig } from '@/client/lib/settings';

const FormSettings: FC = () => {
  const {
    settingsStore: { uiSettings },
  } = useRootStore();

  const formSettings = useForm<FormStateSettings>({
    defaultValues: uiSettings,
    mode: 'onBlur',
  });

  return (
    <FormProvider {...formSettings}>
      <form onBlur={formSettings.handleSubmit(saveSettingsToConfig)} className={styles.component}>
        <RedditSettings />
        <DefaultSavePath />
        <TelegramBotSetting />
        <YaPlakal />
      </form>
    </FormProvider>
  );
};

export default observer(FormSettings);
