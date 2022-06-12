import type { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';

import SelectedImagesForTelegram from '@/client/components/SelectedImagesForTelegram';

const SelectedRedditImagesToTelegram: FC = () => {
  const {
    mediaNewsUI: {
      countMediaToTelegram: { allSelected, currentSelected },
      clearMediaToTelegramFromChannel,
      toggleModeSelectMedia,
    },
  } = useMediaNewsStore();
  return (
    <SelectedImagesForTelegram
      allSelected={allSelected}
      currentSelected={currentSelected}
      clearSelectedOnCurrentPage={clearMediaToTelegramFromChannel}
      toggleSendMediaMode={toggleModeSelectMedia}
    />
  );
};

export default observer(SelectedRedditImagesToTelegram);
