import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import YaPlakalNewsToolbar from '@/client/features/YaPlakalNewsToolbar';
import YaPlakalListForums from '@/client/features/YaPlakalListForums';
import styles from './YaplakalNewContainer.module.css';
import YaTopic from '@/client/features/YaTopic';

const { ipcRenderer } = window.electron;

const YaplakalNewContainer: FC = () => {
  const didYapRef = useRef(false);
  const {
    listForums: { loadForums },
    mediaNewsContentStore: { loadMediaForum, setMediaPreview },
  } = useMediaNewsStore();

  useEffect(() => {
    if (didYapRef.current === false) {
      didYapRef.current = true;
      // Вешать всякие обработчики
      ipcRenderer.yaplakalResponseNews((_, list) => {
        loadForums(list);
      });
      ipcRenderer.yaplakalResponseTopic((_, data) => {
        loadMediaForum(data);
      });
      ipcRenderer.yaplakalResponseTopicPreview((_, data) => {
        setMediaPreview(data);
      });
    }
    return () => {
      ipcRenderer.removeListenersYaplakalnews();
    };
  }, []);
  const [searchParams] = useSearchParams();
  const hrefYap = searchParams.get('href');

  return (
    <div className={styles.component}>
      {!hrefYap ? (
        <>
          <YaPlakalNewsToolbar />
          <hr className={styles.line} />
          <YaPlakalListForums />
        </>
      ) : (
        <YaTopic />
      )}
    </div>
  );
};

export default observer(YaplakalNewContainer);
