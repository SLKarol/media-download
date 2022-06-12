import type { FC } from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useFormContext } from 'react-hook-form';
import { Button, Classes, Label } from '@blueprintjs/core';

import { useRootStore } from '@client/mobxStore/root';
import type { FormStateSettings } from '@/types/settings';
import styles from './DefaultSavePath.module.css';

const DefaultSavePath: FC = () => {
  const { setValue } = useFormContext<FormStateSettings>();
  // const defaultSavePath = watch('defaultSavePath');
  const {
    settingsStore: {
      settings: { defaultSavePath },
    },
  } = useRootStore();
  useEffect(() => {
    setValue('defaultSavePath', defaultSavePath);
  }, [defaultSavePath]);
  const onClick = () => {
    window.electron.ipcRenderer.changeDefaultVideoSaveDir();
  };
  return (
    <>
      <Label>Каталог сохранения загрузок:</Label>
      <div className={styles.component}>
        <span className={Classes.TEXT_OVERFLOW_ELLIPSIS}>{defaultSavePath}</span>
        <Button icon="folder-open" onClick={onClick} />
      </div>
    </>
  );
};

export default observer(DefaultSavePath);
