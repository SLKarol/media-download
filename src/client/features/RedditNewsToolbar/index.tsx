import type { FC } from 'react';
import { ControlGroup } from '@blueprintjs/core';
import clsx from 'clsx';

import styles from './RedditNewsToolbar.module.css';
import RedditNewsSelectSubscribe from './RedditNewsSelectSubscribe';
import ButtonSetRandomSubscribe from './ButtonSetRandomSubscribe';
import ButtonGetRedditNews from './ButtonGetRedditNews';

const RedditNewsToolbar: FC = () => {
  return (
    <>
      <h5 className={clsx('bp4-heading', styles.title)}>Что нового по Вашим подписанным каналам</h5>
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
