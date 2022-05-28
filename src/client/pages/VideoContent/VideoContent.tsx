import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import InputVideoUrl from '@client/features/ShowVideoInfo/InputVideoUrl/InputVideoUrl';
import ShowVideoInfo from '@client/features/ShowVideoInfo/ShowVideoInfo/ShowVideoInfo';
import styles from './VideoContent.module.css';

const VideoContent = () => {
  const [showDetails, setShowDetails] = useState(false);

  /**
   * Обработка введённого URL
   */
  const onEnterUrl = async (url: string) => {
    if (url.length) {
      setShowDetails(true);
      return window.electron.ipcRenderer.getInfo(url);
    }
    // Если не ввёл URL, значит детали скрыть
    return setShowDetails(false);
  };

  return (
    <div className={styles.component}>
      <InputVideoUrl details={showDetails} onEnterUrl={onEnterUrl} />
      <ShowVideoInfo isOpen={showDetails} />
    </div>
  );
};

export default observer(VideoContent);
