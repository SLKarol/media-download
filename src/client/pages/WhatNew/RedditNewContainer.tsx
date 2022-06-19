import type { FC } from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';
import styles from './RedditNewContainer.module.css';
import RedditNewsToolbar from '@/client/features/RedditNewsToolbar';
import RedditNewsSelectedSub from '@/client/features/RedditNewsSelectedSub';
import RedditNewsContent from '@/client/features/RedditNewsContent';
import RedditSendTgToolbar from '@/client/features/RedditSendTgToolbar';
import RedditNewsTodayHoliday from '@/client/features/RedditNewsTodayHoliday';
import RedditPreviewSending from '@/client/features/RedditPreviewSending';
import RedditMoreNews from '@/client/features/RedditMoreNews';

const { ipcRenderer } = window.electron;

const RedditNewContainer: FC = () => {
  const {
    redditSubscribeStore: { loadSubscribes },
    mediaNewsContentStore: { loadRedditNewRecords, setMediaPreview },
    mediaNewsUI: { modeSelectMedia },
  } = useMediaNewsStore();
  const {
    uiState: { setAppBusy },
  } = useRootStore();

  useEffect(() => {
    setAppBusy(true);
    ipcRenderer.getMySubreddit();
  }, []);

  useEffect(() => {
    ipcRenderer.redditResponseMyReddits((_, list) => {
      setAppBusy(false);
      loadSubscribes(list);
    });
    ipcRenderer.redditResponseNews((_, data) => {
      setAppBusy(false);
      loadRedditNewRecords(data);
    });
    ipcRenderer.receiveMediaGroupPreview((_, data) => {
      setMediaPreview(data);
    });
    return () => {
      ipcRenderer.removeListenerResponseMyReddits();
    };
  }, []);

  return (
    <div className={styles.component}>
      {modeSelectMedia ? (
        <>
          <RedditNewsToolbar />
          <RedditNewsSelectedSub />
          <hr className={styles.line} />
          <RedditNewsContent />
          <RedditMoreNews />
        </>
      ) : (
        <>
          <RedditSendTgToolbar />
          <RedditNewsTodayHoliday />
          <hr className={styles.line} />
          <RedditPreviewSending />
        </>
      )}
    </div>
  );
};

export default observer(RedditNewContainer);
