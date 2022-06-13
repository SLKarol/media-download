import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import InputVideoUrl from '@client/features/ShowVideoInfo/InputVideoUrl/InputVideoUrl';
import ShowVideoInfo from '@client/features/ShowVideoInfo/ShowVideoInfo/ShowVideoInfo';
import styles from './VideoContent.module.css';
import { VIDEO_SOURCES } from '@/constants/videoSrc';

const VideoContent = () => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
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
    return window.electron.ipcRenderer.getInfo(url);
  };

  return (
    <div className={styles.component}>
      <InputVideoUrl details={showDetails} onEnterUrl={onEnterUrl} />
      <ShowVideoInfo isOpen={showDetails} />
    </div>
  );
};

export default observer(VideoContent);
