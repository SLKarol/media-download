import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { useRootStore } from '@client/mobxStore/root';
import InputVideoUrl from '@client/features/ShowVideoInfo/InputVideoUrl/InputVideoUrl';
import ShowVideoInfo from '@client/features/ShowVideoInfo/ShowVideoInfo/ShowVideoInfo';
import styles from './VideoContent.module.css';
import { VIDEO_SOURCES } from '@/constants/videoSrc';
import { MediaRecordSelectChapters } from '@/client/features/MediaRecordSelectChapters';

const VideoContent = () => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const {
    uiState: { setAppBusy },
  } = useRootStore();
  /**
   * Обработка введённого URL
   */
  const onEnterUrl = async (url: string) => {
    if (!url.length) {
      // Если не ввёл URL, значит детали скрыть
      return setShowDetails(false);
    }
    if (VIDEO_SOURCES.get('www.yaplakal.com').pattern.test(url)) {
      const forumUrl = url.replace('https://', '').replace('www.', '').replace('yaplakal.com/', '');
      return navigate(`/yaplakalNew/?href=${forumUrl}`);
    }
    setShowDetails(true);
    setAppBusy(true);
    return window.electron.ipcRenderer.getInfo(url);
  };

  return (
    <div className={styles.component}>
      <InputVideoUrl details={showDetails} onEnterUrl={onEnterUrl} />
      <ShowVideoInfo isOpen={showDetails} />
      <MediaRecordSelectChapters />
    </div>
  );
};

export default observer(VideoContent);
