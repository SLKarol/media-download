import type { FC } from 'react';
import { ProgressBar, Intent } from '@blueprintjs/core';

interface Props {
  type: 'video' | 'audio' | 'subtitle' | 'picture';
  downloaded: number;
  total: number;
}

const ProgressDownload: FC<Props> = ({ type, downloaded, total }) => {
  let intent: Intent;
  if (type === 'video') {
    intent = Intent.PRIMARY;
  }
  if (type === 'audio') {
    intent = Intent.SUCCESS;
  }
  if (type === 'picture') {
    intent = Intent.SUCCESS;
  }
  const value = downloaded / total;
  return <ProgressBar intent={intent} value={value} />;
};

export default ProgressDownload;
