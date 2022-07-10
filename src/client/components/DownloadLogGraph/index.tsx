import type { FC, MouseEventHandler } from 'react';
import { Card, H5, Button } from '@blueprintjs/core';
import clsx from 'clsx';

import type { DownloadLogs } from '@/client/mobxStore/fileStatus';
import styles from './index.module.css';
import IconWithProgress from './IconWithProgress';

interface Props extends DownloadLogs {
  onCancel: MouseEventHandler;
}

const DownloadLogGraph: FC<Props> = ({ title, audio, picture, subtitle, video, id, onCancel }) => {
  return (
    <Card className={styles.component}>
      <H5>{title}</H5>
      <div className={styles.graphContainer}>
        {video && (
          <IconWithProgress icon="video" downloaded={video.downloaded} total={video.total} />
        )}
        {audio && (
          <IconWithProgress icon="audio" downloaded={audio.downloaded} total={audio.total} />
        )}
        {subtitle && (
          <IconWithProgress
            icon="subtitle"
            downloaded={subtitle.downloaded}
            total={subtitle.total}
          />
        )}
        {picture && (
          <IconWithProgress icon="picture" downloaded={picture.downloaded} total={picture.total} />
        )}
        <Button
          icon="trash"
          className={clsx(video && audio && styles.twoLines)}
          intent="danger"
          title="Отменить"
          data-id={id}
          onClick={onCancel}
        />
      </div>
    </Card>
  );
};

export default DownloadLogGraph;
