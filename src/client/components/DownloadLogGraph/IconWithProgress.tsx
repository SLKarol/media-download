/* eslint-disable camelcase */
import type { FC } from 'react';
import IconWhatDownload from './IconWhatDownload';
import ProgressDownload from './ProgressDownload';

interface Props {
  icon: 'video' | 'audio' | 'subtitle' | 'picture';
  downloaded: number;
  total: number;
}

const IconWithProgress: FC<Props> = ({ icon, downloaded, total }) => {
  return (
    <>
      <IconWhatDownload icon={icon} />
      <ProgressDownload type={icon} downloaded={downloaded} total={total} />
    </>
  );
};

export default IconWithProgress;
