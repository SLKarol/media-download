import type { FC } from 'react';
import { Card, H5, Intent, Button, Collapse } from '@blueprintjs/core';

import { JournalUI, StatusJournal } from '@/client/mobxStore/journal';
import styles from './index.module.css';
import JournalDetails from './JournalDetails';
import { useToggleState } from '@/client/hooks/useToggleState';
import { getTextStatus } from '@/client/lib/journal';

const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const JournalRecordDownload: FC<JournalUI> = ({ lastModified, status, events, title }) => {
  const [open, setOpen] = useToggleState();
  let intent: Intent = Intent.NONE;
  const textStatus = getTextStatus(status);
  if (status === StatusJournal.ERROR) {
    intent = Intent.DANGER;
  }
  if (status === StatusJournal.LOADED) {
    intent = Intent.SUCCESS;
  }
  if (status === StatusJournal.LOADING) {
    intent = Intent.PRIMARY;
  }
  if (status === StatusJournal.TELEGRAM_SENDING) {
    intent = Intent.PRIMARY;
  }
  if (status === StatusJournal.TELEGRAM_SEND) {
    intent = Intent.SUCCESS;
  }
  return (
    <Card className={styles.component}>
      <H5>{title}</H5>
      <div className={styles.shortInfo}>
        <span>
          {dateTimeFormat.format(new Date(lastModified))} {textStatus}
        </span>
        <Button minimal intent={intent} onClick={setOpen}>
          Детальный журнал
        </Button>
      </div>
      <Collapse isOpen={open}>
        <JournalDetails events={events} />
      </Collapse>
    </Card>
  );
};

export default JournalRecordDownload;