import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import AppRoutes from '@client/routes/AppRoutes';
import { useRootStore } from '@client/mobxStore/root';

import styles from './Main.module.css';

const { ipcRenderer } = window.electron;

const Main = () => {
  const navigate = useNavigate();

  const {
    settingsStore: { save },
    uiState: { setAppBusy },
    journalStore: { addJournalRecord },
    holidaysStore: { loadHolydays },
  } = useRootStore();
  const didMainRef = useRef(false);

  useEffect(() => {
    if (didMainRef.current === false) {
      didMainRef.current = true;

      // Запросить настройки
      ipcRenderer.getSettings();
      // Записать настройки в стор
      ipcRenderer.receiveSettings((_, settings) => {
        save(settings);
      });
      // обработчик меню
      ipcRenderer.onSelectMenu((_, menuId) => {
        if (menuId === 'settings') {
          return navigate('/settings/');
        }
        if (menuId === 'enterUrl') {
          return navigate('/videoContent/');
        }
        if (menuId === 'reportDownload') {
          return navigate('/reportDownload/');
        }
        if (menuId === 'new:reddit') {
          return navigate('/redditNew/');
        }
        if (menuId === 'new:yaplakal') {
          return navigate('/yaplakalNew/');
        }
        return undefined;
      });
      ipcRenderer.onBackendBusy((_, value) => {
        setAppBusy(value);
      });

      ipcRenderer.addJournalRecord((_, props) => {
        // Отдать в журнал
        addJournalRecord(props);
      });

      ipcRenderer.holidaysGet();
      ipcRenderer.holidaysResponse((_, values) => loadHolydays(values));
    }
    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, []);

  return (
    <div className={styles.component}>
      <AppRoutes />
    </div>
  );
};

export default Main;
