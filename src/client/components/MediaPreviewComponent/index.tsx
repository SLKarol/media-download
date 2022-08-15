import type { FC } from 'react';

import styles from './index.module.css';

interface Props {
  decoded?: string;
  title: string;
  noMedia?: boolean;
}

const MediaPreviewComponent: FC<Props> = ({ decoded = '', title, noMedia }) => {
  return (
    <div>
      {decoded && !noMedia ? <img src={decoded} alt={title} className={styles.img} /> : null}
    </div>
  );
};

export default MediaPreviewComponent;
