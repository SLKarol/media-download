import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import MediaCard from '@/client/components/MediaCard';
import styles from './YaTopicListMedia.module.css';
import SelectThisMediaForTelegram from '@/client/features/SelectThisMediaForTelegram';

const YaTopicListMedia: FC = () => {
  const {
    mediaNewsContentStore: { newRecordsUiData, onSelectMediaAction },
    mediaNewsUI: { mediaToTelegram },
  } = useMediaNewsStore();

  return (
    <div className={styles.component}>
      {newRecordsUiData.map((r) => (
        <MediaCard key={r.id} {...r} onSelectMediaAction={onSelectMediaAction}>
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

export default observer(YaTopicListMedia);
