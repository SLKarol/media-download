import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './index.module.css';
import MediaCard from '@/client/components/MediaCard';
import SelectThisMediaForTelegram from './SelectThisMediaForTelegram';

const RedditNewsContent: FC = () => {
  const {
    redditNewsContentStore: { newRecordsUiData },
    redditNewsUI: { mediaToTelegram },
  } = useRedditNewsStore();

  return (
    <div className={styles.component}>
      {newRecordsUiData.map((r) => (
        <MediaCard key={r.id} {...r}>
          {!r.haveVideo ? (
            <SelectThisMediaForTelegram
              id={r.id}
              unSupportTelegram={r.unSupportTelegram}
              checked={mediaToTelegram.has(r.id)}
            />
          ) : null}
        </MediaCard>
      ))}
    </div>
  );
};

export default observer(RedditNewsContent);
