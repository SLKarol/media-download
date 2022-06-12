import type { FC, MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, H5, Card, Elevation } from '@blueprintjs/core';

import styles from './RedditPreviewCard.module.css';
import type { MediaToTelegram } from '@/client/mobxStore/mediaNewsUI';

interface Props extends MediaToTelegram {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const RedditPreviewCard: FC<Props> = ({ title, decoded, id, onClick }) => {
  return (
    <Card elevation={Elevation.ONE} className={styles.card}>
      <H5>{title}</H5>
      <div>
        <img src={decoded} alt={title} className={styles.img} />
      </div>
      <Button icon="trash" data-id={id} onClick={onClick} />
    </Card>
  );
};

export default observer(RedditPreviewCard);
