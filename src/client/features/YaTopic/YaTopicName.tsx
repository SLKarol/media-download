import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './YaTopicName.module.css';

const YaTopicName: FC = () => {
  const {
    mediaNewsUI: { fullNameSelectedforum },
  } = useMediaNewsStore();
  return <div className={styles.component}>{fullNameSelectedforum}</div>;
};

export default observer(YaTopicName);
