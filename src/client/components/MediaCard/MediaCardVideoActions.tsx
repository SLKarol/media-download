/* eslint-disable no-unused-vars */
import type { FC, MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';

import VideoActions from '@client/components/VideoActions';
import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  id: string;
  onSelectMediaAction: (id: string, action: MediaActions) => void;
  idVideoSource: string;
}

const MediaCardVideoActions: FC<Props> = ({ id, onSelectMediaAction, idVideoSource }) => {
  const {
    uiState: { appBusy },
  } = useRootStore();

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const { currentTarget } = e;
    const action = currentTarget.getAttribute('data-action');
    onSelectMediaAction(id, action as MediaActions);
  };

  return (
    <VideoActions
      idMedia={id}
      visibleVote={idVideoSource === 'www.reddit.com'}
      disabled={appBusy}
      onClick={onClick}
    />
  );
};

export default observer(MediaCardVideoActions);
