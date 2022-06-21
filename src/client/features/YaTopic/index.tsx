import type { FC } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import YaTopicToolbar from './YaTopicToolbar';
import YaTopicListMedia from './YaTopicListMedia';
import YaTopicName from './YaTopicName';
import SelectedRedditImagesToTelegram from '@/client/features/RedditNewsSelectedSub/SelectedRedditImagesToTelegram';
import RedditSendTgToolbar from '@/client/features/RedditSendTgToolbar';
import RedditPreviewSending from '@/client/features/RedditPreviewSending';
import CheckBoxSendTitleForMedia from '@/client/features/CheckBoxSendTitleForMedia';
import RedditNewsTodayHoliday from '@/client/features/RedditNewsTodayHoliday';
import styles from './index.module.css';

const { ipcRenderer } = window.electron;

const YaTopic: FC = () => {
  const [searchParams] = useSearchParams();
  const hrefYap = searchParams.get('href');
  const {
    mediaNewsUI: { clearTopicPages, modeSelectMedia, selectedForum },
    mediaNewsContentStore: { clearContent },
  } = useMediaNewsStore();
  const {
    uiState: { setAppBusy },
  } = useRootStore();

  useEffect(() => {
    if (hrefYap) {
      clearTopicPages();
      clearContent();
      setAppBusy(true);
      ipcRenderer.getYaplakalTopic(hrefYap);
    }
  }, []);

  useEffect(() => {
    if (!selectedForum) {
      setAppBusy(true);
      ipcRenderer.getYaplakalTopicName(hrefYap);
    }
  }, [selectedForum]);

  return (
    <div>
      {modeSelectMedia ? (
        <>
          <YaTopicName />
          <YaTopicToolbar />
          <SelectedRedditImagesToTelegram />
          <YaTopicListMedia />
        </>
      ) : (
        <>
          <RedditSendTgToolbar />
          <RedditNewsTodayHoliday />
          <CheckBoxSendTitleForMedia />
          <hr className={styles.line} />
          <RedditPreviewSending />
        </>
      )}
    </div>
  );
};

export default observer(YaTopic);
