import type { FC, PropsWithChildren } from 'react';
import { H5, Card, Elevation } from '@blueprintjs/core';

import MediaPreviewComponent from '@client/components/MediaPreviewComponent';
import type { MediaSummaryUi } from '@/types/media';
import styles from './index.module.css';
import MediaCardVideoActions from './MediaCardVideoActions';
import type { MediaActions } from '@/client/constants/mediaActions';

interface Props extends Partial<MediaSummaryUi> {
  onSelectMediaAction?: (id: string, action: MediaActions) => void;
}

const MediaCard: FC<PropsWithChildren<Props>> = ({
  title,
  previewImages,
  dimensions,
  id,
  children,
  onSelectMediaAction,
  idVideoSource,
}) => {
  return (
    <Card elevation={Elevation.ONE} className={styles.component}>
      <H5>{title}</H5>
      <MediaPreviewComponent decoded={previewImages?.decoded} title={title} />
      <span>{dimensions}</span>
      <MediaCardVideoActions
        id={id}
        onSelectMediaAction={onSelectMediaAction}
        idVideoSource={idVideoSource}
      />
      {children}
    </Card>
  );
};

export default MediaCard;
