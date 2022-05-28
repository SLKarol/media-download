import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import NotPreview from './NotPreview';
import MediaPreviewComponent from '@/client/components/MediaPreviewComponent';

const VideoPreviewComponent: FC = () => {
  const {
    videoInfo: {
      info: { previewImages, title },
    },
    uiState: { appBusy },
  } = useRootStore();

  if (appBusy || !previewImages.decoded) return <NotPreview loading={appBusy} />;

  return <MediaPreviewComponent previewImages={previewImages} title={title} />;
};

export default observer(VideoPreviewComponent);
