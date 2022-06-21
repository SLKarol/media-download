import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';

import AppRoutes from '@client/routes/AppRoutes';
import { useRootStore } from '@client/mobxStore/root';

import styles from './Main.module.css';

const { ipcRenderer } = window.electron;

const Main = () => {
  const navigate = useNavigate();

  const {
    settingsStore: { save },
    uiState: { setAppBusy },
    fileStatus: { addStatusRecord, nowDownloading },
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
      ipcRenderer.onBackendError(() => {
        setAppBusy(false);
      });

      ipcRenderer.addJournalRecord((_, props) => {
        // Отдать в журнал
        addStatusRecord(props);
      });

      ipcRenderer.holidaysGet();
      ipcRenderer.holidaysResponse((_, values) => loadHolydays(values));
    }
    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    autorun(() => {
      ipcRenderer.appChangeTitle(`Media Downloader${nowDownloading ? ' - Идёт загрузка' : ''}`);
    });
  });

  return (
    <div className={styles.component}>
      <AppRoutes />
    </div>
  );
};

export default observer(Main);
