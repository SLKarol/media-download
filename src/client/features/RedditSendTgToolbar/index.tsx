import type { FC } from 'react';
import { ControlGroup, Button, H5 } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './index.module.css';
import ButtonSendMedias from './ButtonSendMedias';

const RedditSendTgToolbar: FC = () => {
  const {
    redditNewsUI: { toggleModeSelectMedia, clearMediaToTelegram },
  } = useRedditNewsStore();

  return (
    <div className={styles.component}>
      <H5 className={styles.alignCenter}>Материалы для рассылки в телеграм</H5>
      <ControlGroup>
        <Button icon="undo" title="К новостям" onClick={toggleModeSelectMedia} />
        <ButtonSendMedias />
        <Button icon="eraser" title="Очистить список" onClick={clearMediaToTelegram} />
      </ControlGroup>
    </div>
  );
};

export default observer(RedditSendTgToolbar);
