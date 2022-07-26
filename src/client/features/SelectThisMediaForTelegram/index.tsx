import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@blueprintjs/core';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import styles from './index.module.css';
import SelectThisMediaLabel from './SelectThisMediaLabel';

interface Props {
  id: string;
  unSupportTelegram?: boolean;
  checked: boolean;
}

/**
 * Чекбокс с подписью "Отправить в список рассылки"
 */
const SelectThisMediaForTelegram: FC<Props> = ({ id, unSupportTelegram, checked }) => {
  const {
    mediaNewsUI: { toggleMediaToTelegram },
  } = useMediaNewsStore();

  return (
    <Checkbox
      checked={checked}
      labelElement={<SelectThisMediaLabel unSupportTelegram={unSupportTelegram} />}
      className={styles.component}
      onChange={() => {
        toggleMediaToTelegram(id);
      }}
    />
  );
};

export default observer(SelectThisMediaForTelegram);
