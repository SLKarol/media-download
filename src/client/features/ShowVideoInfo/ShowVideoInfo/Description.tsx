import type { FC } from 'react';
import clsx from 'clsx';
import { Classes } from '@blueprintjs/core';

import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import styles from './Description.module.css';
import CheckSendVote from './CheckSendVote';

const Description: FC = () => {
  const {
    videoInfo: {
      videoDescription: { subReddit, over18, haveVideo, dimensions },
      isVideoReddit,
    },
    uiState: { appBusy },
  } = useRootStore();

  return (
    <ul className={clsx(styles.list, appBusy && Classes.SKELETON)}>
      {dimensions && <li className={styles.listItem}>{dimensions}</li>}
      {isVideoReddit && (
        <li className={styles.listItem}>
          <strong>Канал: </strong>
          {subReddit}
        </li>
      )}
      {over18 ? <li className={styles.listItem}>18+</li> : null}
      {!haveVideo ? <li className={styles.listItem}>Видео недоступно</li> : null}
      <li className={styles.listItemMarginTop}>
        <CheckSendVote />
      </li>
    </ul>
  );
};

export default observer(Description);
