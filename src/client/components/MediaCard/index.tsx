import type { FC, PropsWithChildren } from 'react';
import { H5, Card, Elevation } from '@blueprintjs/core';
import clsx from 'clsx';

import MediaPreviewComponent from '@client/components/MediaPreviewComponent';
import type { MediaSummaryUi } from '@/types/media';
import styles from './index.module.css';
import MediaCardVideoActions from './MediaCardVideoActions';
import type { MediaActions } from '@/client/constants/mediaActions';
import MediaCollection from '@/client/components/MediaCollection';

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
  hasChapters,
  collection,
  videoFormats,
  hasPreview,
  noMedia,
}) => {
  return (
    <Card elevation={Elevation.ONE} className={styles.component}>
      <H5>{title}</H5>
      {created ? (
        <span className={clsx('bp4-text-small', styles.marginBottom)}>{created}</span>
      ) : null}
      <MediaPreviewComponent decoded={previewImages?.decoded} title={title} noMedia={noMedia} />
      {collection && <MediaCollection collection={collection} />}
      {dimensions ? <span className={styles.marginBottom}>{dimensions}</span> : null}
      {noMedia ? (
        <span className={clsx(styles.marginBottom, styles.warning)}>
          Не содержит (или не найдены) медиа-ресурсы
        </span>
      ) : null}
      <MediaCardVideoActions
        id={id}
        onSelectMediaAction={onSelectMediaAction}
        idVideoSource={idVideoSource}
        hasChapters={hasChapters}
        videoFormats={videoFormats}
        hasPreview={hasPreview}
        noMedia={noMedia}
      />
      {children}
    </Card>
  );
};

export default MediaCard;
