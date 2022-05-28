import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, Button } from '@blueprintjs/core';

import { useRootStore } from '@client/mobxStore/root';
import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './index.module.css';

const RedditNewsTodayHoliday: FC = () => {
  const {
    holidaysStore: { selectedHoliday, changeRandomHolyday },
  } = useRootStore();

  const {
    redditNewsUI: { enableSendHolidayName, toggleEnabledSendHolidayName },
  } = useRedditNewsStore();

  return (
    <div className={styles.container}>
      <Checkbox
        checked={enableSendHolidayName}
        label={selectedHoliday}
        onChange={toggleEnabledSendHolidayName}
      />
      <Button icon="random" onClick={changeRandomHolyday} />
    </div>
  );
};

export default observer(RedditNewsTodayHoliday);
