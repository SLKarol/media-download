import type { FC, PropsWithChildren } from 'react';
import { H5, Card, Elevation } from '@blueprintjs/core';
import clsx from 'clsx';

import MediaPreviewComponent from '@client/components/MediaPreviewComponent';
import type { MediaSummaryUi } from '@/types/media';
import styles from './index.module.css';
import MediaCardVideoActions from './MediaCardVideoActions';
import type { MediaActions } from '@/client/constants/mediaActions';

interface Props extends Partial<MediaSummaryUi> {
  // eslint-disable-next-line no-unused-vars
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
  created,
}) => {
  return (
    <Card elevation={Elevation.ONE} className={styles.component}>
      <H5>{title}</H5>
      {created ? <span className={clsx('bp4-text-small', styles.dateTime)}>{created}</span> : null}
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
