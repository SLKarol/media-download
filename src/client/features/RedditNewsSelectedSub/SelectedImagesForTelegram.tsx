import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { Classes, Tooltip2 } from '@blueprintjs/popover2';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './SelectedImagesForTelegram.module.css';

const SelectedImagesForTelegram: FC = () => {
  const {
    redditNewsUI: {
      countMediaToTelegram: { allSelected, currentSelected },
      clearMediaToTelegramFromChannel,
      toggleModeSelectMedia,
    },
  } = useRedditNewsStore();
  return (
    <div className={styles.component}>
      <span>
        Всего выбрано для отправки в телеграм:{' '}
        <Tooltip2 className={Classes.TOOLTIP2_INDICATOR} content="Всего/На этом канале">
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
        onClick={toggleModeSelectMedia}
      />
      <Tooltip2 content="Очищает выбор на текущем канале">
        <Button onClick={clearMediaToTelegramFromChannel}>Очистить</Button>
      </Tooltip2>
    </div>
  );
};

export default observer(SelectedImagesForTelegram);
