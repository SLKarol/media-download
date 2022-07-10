import type { FC, MouseEventHandler } from 'react';
import { useState } from 'react';
import { H4, Tab, Tabs } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import styles from './index.module.css';
import JournalRecordDownload from '@/client/components/JournalRecordDownload';
import DownloadLogGraph from '@/client/components/DownloadLogGraph';

const { ipcRenderer } = window.electron;

/**
 * Журнал загрузки
 */
const DownloadJournal = observer(() => {
  const {
    fileStatus: { listingJournal },
  } = useRootStore();
  return (
    <>
      {listingJournal.map(({ id, ...jProps }) => (
        <JournalRecordDownload key={id} id={id} {...jProps} />
      ))}
    </>
  );
});
/**
 * График загрузки
 */
const DownloadGraph = observer(() => {
  const {
    fileStatus: { downloadLog },
  } = useRootStore();
  const onCancel: MouseEventHandler = (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    ipcRenderer.downloadCancel(id);
  };

  return (
    <>
      {downloadLog.map(({ id, ...props }) => (
        <DownloadLogGraph key={id} id={id} {...props} onCancel={onCancel} />
      ))}
    </>
  );
});

/**
 * Отчёты о загрузках
 */
const ReportDownload: FC = () => {
  const [selectedTabId, setSelectedTabId] = useState('journal');

  return (
    <div className={styles.component}>
      <H4 className={styles.textAlignCenter}>Отчёт о загрузке файлов</H4>
      <Tabs
        id="tabsDownload"
        renderActiveTabPanelOnly
        onChange={(q) => setSelectedTabId(q as string)}
        selectedTabId={selectedTabId}>
        <Tab id="journal" title="Журнал" panel={<DownloadJournal />} />
        <Tab id="graph" title="График" panel={<DownloadGraph />} />
      </Tabs>
    </div>
  );
};

export default ReportDownload;
