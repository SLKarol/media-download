import type { FC } from 'react';
import { Card, H5, Intent, Button, Collapse } from '@blueprintjs/core';

import { JournalUI, StatusFile } from '@/client/mobxStore/fileStatus';
import styles from './index.module.css';
import JournalDetails from './JournalDetails';
import { useToggleState } from '@/client/hooks/useToggleState';
import { getTextStatus } from '@/client/lib/journal';

const JournalRecordDownload: FC<JournalUI> = ({ lastModified, status, events, title }) => {
  const [open, setOpen] = useToggleState();
  let intent: Intent = Intent.NONE;
  const textStatus = getTextStatus(status);
  if (status === StatusFile.ERROR) {
    intent = Intent.DANGER;
  }
  if (status === StatusFile.LOADED) {
    intent = Intent.SUCCESS;
  }
  if (status === StatusFile.LOADING) {
    intent = Intent.PRIMARY;
  }
  if (status === StatusFile.TELEGRAM_SENDING) {
    intent = Intent.PRIMARY;
  }
  if (status === StatusFile.TELEGRAM_SEND) {
    intent = Intent.SUCCESS;
  }
  return (
    <Card className={styles.component}>
      <H5>{title}</H5>
      <div className={styles.shortInfo}>
        <span>
          {lastModified} {textStatus}
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
