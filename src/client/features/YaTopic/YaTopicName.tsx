import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './YaTopicName.module.css';

const YaTopicName: FC = () => {
  const {
    mediaNewsUI: {
      selectedForum: { description },
      selectedTopic: { name },
    },
  } = useMediaNewsStore();
  return (
    <div className={styles.component}>
      {description} - {name}
    </div>
  );
};

export default observer(YaTopicName);
