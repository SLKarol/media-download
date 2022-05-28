import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, H6 } from '@blueprintjs/core';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './RedditNewsSelectedSub.module.css';
import SelectedImagesForTelegram from './SelectedImagesForTelegram';

const RedditNewsSelectedSub: FC = () => {
  const {
    redditNewsUI: { selectedSubscribe, sendVote, toggleSendVote },
  } = useRedditNewsStore();
  if (!selectedSubscribe) return null;
  return (
    <div className={styles.component}>
      <H6>{selectedSubscribe.id}</H6>
      <span>{selectedSubscribe.title}</span>
      <Checkbox
        checked={sendVote}
        label="Во время скачивания проголосовать"
        onChange={toggleSendVote}
      />
      <SelectedImagesForTelegram />
    </div>
  );
};

export default observer(RedditNewsSelectedSub);
