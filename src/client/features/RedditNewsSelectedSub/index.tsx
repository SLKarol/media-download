import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, H6 } from '@blueprintjs/core';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './index.module.css';
import SelectedRedditImagesToTelegram from './SelectedRedditImagesToTelegram';

const RedditNewsSelectedSub: FC = () => {
  const {
    mediaNewsUI: { selectedSubscribe, sendVote, toggleSendVote },
  } = useMediaNewsStore();
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
      <SelectedRedditImagesToTelegram />
    </div>
  );
};

export default observer(RedditNewsSelectedSub);
