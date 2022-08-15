import type { FC, MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';

import VideoActions from '@client/components/VideoActions';
import { MediaActions } from '@/client/constants/mediaActions';

interface Props {
  id: string;
  // eslint-disable-next-line no-unused-vars
  onSelectMediaAction: (id: string, action: MediaActions) => void;
  idVideoSource: string;
  /**
   * Если возможность разбить на части?
   */
  hasChapters?: boolean;

  /**
   * "720p", "1080p" и т.д.
   */
  videoFormats?: string[];

  /**
   * Есть превью-изображение?
   */
  hasPreview: boolean;

  /**
   * Не содержит мультимедиа?
   */
  noMedia?: boolean;
}

const MediaCardVideoActions: FC<Props> = ({
  id,
  onSelectMediaAction,
  idVideoSource,
  hasChapters,
  videoFormats,
  hasPreview,
  noMedia,
}) => {
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
      disabled={appBusy || !hasPreview}
      onClick={onClick}
      idVideoSource={idVideoSource}
      hasChapters={hasChapters}
      videoFormats={videoFormats}
      noMedia={noMedia}
    />
  );
};

export default observer(MediaCardVideoActions);
