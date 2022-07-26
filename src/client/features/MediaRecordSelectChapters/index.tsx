import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Classes, Dialog } from '@blueprintjs/core';

import { useRootStore } from '@client/mobxStore/root';
import SelectChaptersForm from './SelectChaptersForm';
import type { FormDataSelectChapters } from '@/types/downloader';

const { ipcRenderer } = window.electron;

/**
 * Выбрать части для скачивания у медиа (используется mobxStore/mediaRecord)
 */
export const MediaRecordSelectChapters: FC = observer(() => {
  const {
    uiState: { showDialogSelectChapters, toggleShowDialogSelectChapters },
    videoInfo: {
      info: { chapters = [], id, title, permalink },
    },
  } = useRootStore();

  const onDownloadChapters = (params: FormDataSelectChapters) => {
    toggleShowDialogSelectChapters();
    ipcRenderer.downloadChapters({ id, title, permalink, settings: { ...params } });
  };

  return (
    <Dialog
      isOpen={showDialogSelectChapters}
      onClose={toggleShowDialogSelectChapters}
      title="Выбрать части для скачивания"
      canOutsideClickClose={false}
      icon="property">
      <div className={Classes.DIALOG_BODY}>
        <SelectChaptersForm
          chapters={chapters}
          onDownloadChapters={onDownloadChapters}
          onCancel={toggleShowDialogSelectChapters}
        />
      </div>
    </Dialog>
  );
});
