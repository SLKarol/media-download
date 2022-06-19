import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';

import ButtonsNextPrev from '@/client/components/ButtonsNextPrev';

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
    const arrayHref = hrefYap.split('/');
    const { 0: forum, [arrayHref.length - 1]: page } = arrayHref;
    const url = `${forum}/st/${current * 25}/${page}`;
    ipcRenderer.getYaplakalTopic(url);
  };
  const onClickPrev = () => {
    clearTopicPages();
    clearContent();
    const prevPageNumb = current - 2;

    const arrayHref = hrefYap.split('/');
    const { 0: forum, [arrayHref.length - 1]: page } = arrayHref;

    const url = `${forum}/st/${prevPageNumb * 25}/${page}`;
    ipcRenderer.getYaplakalTopic(url);
  };

  return (
    <ButtonsNextPrev
      disabledNext={!next}
      disabledPrev={!prev}
      onClickNext={onClickNext}
      onClickPrev={onClickPrev}
      onClickUp={onClickUp}
      disabledSelectForum={appBusy}
      visibleSelectForum
    />
  );
};

export default observer(YaTopicToolbar);
