import type { FC } from 'react';
import { ControlGroup, H5 } from '@blueprintjs/core';

import styles from './RedditNewsToolbar.module.css';
import RedditNewsSelectSubscribe from './RedditNewsSelectSubscribe';
import ButtonSetRandomSubscribe from './ButtonSetRandomSubscribe';
import ButtonGetRedditNews from './ButtonGetRedditNews';

const RedditNewsToolbar: FC = () => {
  return (
    <>
      <H5 className={styles.title}>Что нового по Вашим подписанным каналам</H5>
      <div className={styles.component}>
        <ControlGroup>
          <RedditNewsSelectSubscribe />
          <ButtonSetRandomSubscribe />
        </ControlGroup>
        <ControlGroup>
          <ButtonGetRedditNews />
        </ControlGroup>
      </div>
    </>
  );
};

export default RedditNewsToolbar;
