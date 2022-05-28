import type { FC, MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import { useRootStore } from '@client/mobxStore/root';

import VideoActions from '@client/components/VideoActions';
import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  id: string;
}

const MediaCardVideoActions: FC<Props> = ({ id }) => {
  const {
    uiState: { appBusy },
  } = useRootStore();
  const {
    redditNewsContentStore: { onSelectMediaAction },
  } = useRedditNewsStore();

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const { currentTarget } = e;
    const action = currentTarget.getAttribute('data-action');
    onSelectMediaAction(id, action as MediaActions);
  };

  return <VideoActions idMedia={id} visibleVote disabled={appBusy} onClick={onClick} />;
};

export default observer(MediaCardVideoActions);
