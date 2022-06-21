import { H4 } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import styles from './index.module.css';
import JournalRecordDownload from '@/client/components/JournalRecordDownload';

const ReportDownload = () => {
  const {
    fileStatus: { listingJournal },
  } = useRootStore();

  return (
    <div className={styles.component}>
      <H4 className={styles.textAlignCenter}>Отчёт о загрузке файлов</H4>
      {listingJournal.map(({ id, ...jProps }) => (
        <JournalRecordDownload key={id} id={id} {...jProps} />
      ))}
    </div>
  );
};

export default observer(ReportDownload);
