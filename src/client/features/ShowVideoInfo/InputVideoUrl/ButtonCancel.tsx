import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { useFormContext } from 'react-hook-form';

import { useRootStore } from '@client/mobxStore/root';

interface Props {
  // eslint-disable-next-line no-unused-vars
  onEnterUrl: (url: string) => void;
}

const ButtonCancel: FC<Props> = ({ onEnterUrl }) => {
  const { setFocus, reset } = useFormContext();

  const {
    uiState: { appBusy },
    videoInfo: { clearInfo },
  } = useRootStore();

  /**
   * Сброс URL'a и скрыть детали
   */
  const onClickCancel = () => {
    clearInfo();
    setFocus('url');
    reset();
    // setValue('url', '');
    onEnterUrl('');
  };

  return (
    <Button type="button" onClick={onClickCancel} disabled={appBusy}>
      Ввести другую ссылку
    </Button>
  );
};

export default observer(ButtonCancel);
