import type { FunctionComponent, MouseEventHandler } from 'React';
import { useEffect } from 'react';
import { H5, Classes, Card, Elevation, Collapse } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import VideoActions from '@client/components/VideoActions';
import { useRootStore } from '@client/mobxStore/root';
import Description from './Description';
import VideoPreviewComponent from '../VideoPreview';
import styles from './ShowVideoInfo.module.css';
import { MediaActions } from '@/client/constants/mediaActions';

const { ipcRenderer } = window.electron;
interface Props {
  isOpen: boolean;
}

const ShowVideoInfo: FunctionComponent<Props> = ({ isOpen }) => {
  const {
    uiState: { appBusy, oneVideoDisabled },
    videoInfo: {
      videoDescription: { title, haveVideo, id, idVideoSource },
      setInfo,
      onClickAction,
      setMediaPreview,
    },
  } = useRootStore();

  useEffect(() => {
    ipcRenderer.receiveVideoInfo((_, value) => {
      setInfo(value);
    });
    ipcRenderer.receiveMediaPreview((_, param) => {
      setMediaPreview(param);
    });
  }, []);

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const { currentTarget } = e;
    const action = currentTarget.getAttribute('data-action');
    onClickAction(action as MediaActions);
  };

  return (
    <Collapse isOpen={isOpen}>
      <Card elevation={Elevation.ONE} className={styles.component}>
        <H5 className={clsx(styles.oneColumn, appBusy && Classes.SKELETON)}>{title}</H5>
        <VideoPreviewComponent />
        <Description />
        {!appBusy && haveVideo && (
          <VideoActions
            disabled={oneVideoDisabled}
            idMedia={id}
            visibleVote={idVideoSource === 'www.reddit.com'}
            className={styles.oneColumn}
            onClick={onClick}
          />
        )}
      </Card>
    </Collapse>
  );
};

export default observer(ShowVideoInfo);
