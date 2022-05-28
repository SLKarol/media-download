import type { FC } from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './RedditNewContainer.module.css';
import RedditNewsToolbar from '@/client/features/RedditNewsToolbar';
import RedditNewsSelectedSub from '@/client/features/RedditNewsSelectedSub';
import RedditNewsContent from '@/client/features/RedditNewsContent';
import RedditSendTgToolbar from '@/client/features/RedditSendTgToolbar';
import RedditNewsTodayHoliday from '@/client/features/RedditNewsTodayHoliday';
import RedditPreviewSending from '@/client/features/RedditPreviewSending';

const { ipcRenderer } = window.electron;

const RedditNewContainer: FC = () => {
  const {
    redditSubscribeStore: { loadSubscribes },
    redditNewsContentStore: { loadRedditNewRecords },
    redditNewsUI: { modeSelectMedia },
  } = useRedditNewsStore();

  useEffect(() => {
    ipcRenderer.getMySubreddit();
  }, []);

  useEffect(() => {
    ipcRenderer.redditResponseMyReddits((_, list) => {
      loadSubscribes(list);
    });
    ipcRenderer.redditResponseNews((_, records) => {
      loadRedditNewRecords(records);
    });
    return () => {
      ipcRenderer.removeListenerResponseMyReddits();
      // todo clear stores
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
