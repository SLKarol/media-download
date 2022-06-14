import type { FC } from 'react';
import { Button } from '@blueprintjs/core';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';
import styles from './YaTopicToolbar.module.css';

const { ipcRenderer } = window.electron;

const YaTopicToolbar: FC = () => {
  const navigate = useNavigate();

  const {
    mediaNewsUI: {
      topicPages: { next, prev, current },
      clearTopicPages,
    },
    mediaNewsContentStore: { clearContent },
  } = useMediaNewsStore();

  const [searchParams] = useSearchParams();
  const hrefYap = searchParams.get('href');

  const {
    uiState: { appBusy },
  } = useRootStore();

  const onClickUp = () => {
    clearTopicPages();
    clearContent();
    navigate(-1);
  };
  const onClickNext = () => {
    clearTopicPages();
    clearContent();
    const [forum, page] = hrefYap.split('/');
    const url = `${forum}/st/${current * 25}/${page}`;
    ipcRenderer.getYaplakalTopic(url);
  };
  const onClickPrev = () => {
    clearTopicPages();
    clearContent();
    const prevPageNumb = current - 2;
    let url = hrefYap;
    const [forum, page] = hrefYap.split('/');
    url = `${forum}/st/${prevPageNumb * 25}/${page}`;
    ipcRenderer.getYaplakalTopic(url);
  };

  return (
    <div className={styles.component}>
      <Button
        icon="arrow-left"
        title="На предыдущую страницу топика"
        disabled={!prev}
        onClick={onClickPrev}
      />
      <Button icon="arrow-up" title="К выбору форума" onClick={onClickUp} disabled={appBusy} />
      <Button
        icon="arrow-right"
        title="На следующую страницу топика"
        disabled={!next}
        onClick={onClickNext}
      />
    </div>
  );
};

export default observer(YaTopicToolbar);
