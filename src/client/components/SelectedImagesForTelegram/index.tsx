import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { Classes, Tooltip2 } from '@blueprintjs/popover2';

import styles from './index.module.css';

interface Props {
  allSelected: number;
  currentSelected: number;
  toggleSendMediaMode: () => void;
  clearSelectedOnCurrentPage: () => void;
}

const SelectedImagesForTelegram: FC<Props> = ({
  allSelected,
  currentSelected,
  toggleSendMediaMode,
  clearSelectedOnCurrentPage,
}) => {
  return (
    <div className={styles.component}>
      <span>
        Всего выбрано для отправки в телеграм:{' '}
        <Tooltip2 className={Classes.TOOLTIP2_INDICATOR} content="Всего/На этой странице">
          <>
            {allSelected}/{currentSelected}
          </>
        </Tooltip2>
      </span>
      <Button
        icon="send-message"
        name="open"
        title="Выбранное отправить в телеграм"
        disabled={allSelected < 2}
        onClick={toggleSendMediaMode}
      />
      <Tooltip2 content="Очищает выбор на текущей странице">
        <Button onClick={clearSelectedOnCurrentPage}>Очистить</Button>
      </Tooltip2>
    </div>
  );
};

export default SelectedImagesForTelegram;
