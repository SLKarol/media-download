import type { FC } from 'react';

import styles from './index.module.css';

interface Props {
  decoded?: string;
  title: string;
}

const MediaPreviewComponent: FC<Props> = ({ decoded = '', title }) => {
  return <div>{decoded ? <img src={decoded} alt={title} className={styles.img} /> : null}</div>;
};

export default MediaPreviewComponent;
