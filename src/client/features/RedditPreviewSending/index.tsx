import type { FC, MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './index.module.css';
import RedditPreviewCard from '@/client/components/RedditPreviewCard/RedditPreviewCard';

const RedditPreviewSending: FC = () => {
  const {
    mediaNewsUI: { arrayMediaToTelegram, toggleMediaToTelegram },
  } = useMediaNewsStore();

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    toggleMediaToTelegram(id);
  };

  return (
    <div className={styles.component}>
      {arrayMediaToTelegram.map((r) => (
        <RedditPreviewCard key={r.id} onClick={onClick} {...r} />
      ))}
    </div>
  );
};

export default observer(RedditPreviewSending);
