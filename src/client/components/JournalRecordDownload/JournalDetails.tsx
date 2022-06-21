/* eslint-disable react/no-array-index-key */
import type { FC } from 'react';
import { Classes } from '@blueprintjs/core';
import clsx from 'clsx';

import styles from './JournalDetails.module.css';
import type { IJournalRecord } from '@/client/mobxStore/fileStatus';
import { getTextStatus } from '@/client/lib/journal';

interface Props {
  events: IJournalRecord[];
}

const JournalDetails: FC<Props> = ({ events }) => {
  return (
    <>
      {events.map((e, indx) => (
        <div
          key={`${e.lastModified}${indx}`}
          className={clsx(Classes.MONOSPACE_TEXT, styles.container)}>
          <span className={styles.title}>[{e.lastModified}]</span>
          <strong>{getTextStatus(e.status)}</strong>
          <span>{e.description}</span>
        </div>
      ))}
    </>
  );
};

export default JournalDetails;
