import type { FC } from 'react';
import { useEffect } from 'react';

import FormSettings from '@client/features/Settings/FormSettings';

import styles from './index.module.css';

const Settings: FC = () => {
  useEffect(() => {
    const { ipcRenderer } = window.electron;
    ipcRenderer.getSettings();
  }, []);

  return (
    <div className={styles.component}>
      <FormSettings />
    </div>
  );
};

export default Settings;
