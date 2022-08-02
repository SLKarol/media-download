import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import NotPreview from './NotPreview';
import MediaPreviewComponent from '@/client/components/MediaPreviewComponent';
import MediaCollection from '@/client/components/MediaCollection';

const VideoPreviewComponent: FC = () => {
  const {
    videoInfo: {
      info: {
        previewImages: { decoded = '' },
        title,
        collection,
      },
    },
    uiState: { appBusy },
  } = useRootStore();

  if (collection) {
    return <MediaCollection collection={collection} />;
  }

  if (appBusy || !decoded) return <NotPreview loading={appBusy} />;

  return <MediaPreviewComponent decoded={decoded} title={title} />;
};

export default observer(VideoPreviewComponent);
