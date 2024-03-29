import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import { useRootStore } from '@client/mobxStore/root';
import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './index.module.css';

const RedditNewsTodayHoliday: FC = () => {
  const {
    holidaysStore: { selectedHoliday, changeRandomHolyday },
  } = useRootStore();

  const {
    mediaNewsUI: { enableSendHolidayName, toggleEnabledSendHolidayName },
  } = useMediaNewsStore();

  return (
    <div className={styles.container}>
      <Checkbox
        checked={enableSendHolidayName}
        label={selectedHoliday}
        onChange={toggleEnabledSendHolidayName}
      />
      <Tooltip2 content="Выбрать другой праздник">
        <Button icon="random" onClick={changeRandomHolyday} />
      </Tooltip2>
    </div>
  );
};

export default observer(RedditNewsTodayHoliday);
