import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@blueprintjs/core';

import { useRedditNewsStore } from '@client/mobxStore/redditNews';
import styles from './SelectThisMediaForTelegram.module.css';
import SelectThisMediaLabel from './SelectThisMediaLabel';

interface Props {
  id: string;
  unSupportTelegram?: boolean;
  checked: boolean;
}

const SelectThisMediaForTelegram: FC<Props> = ({ id, unSupportTelegram, checked }) => {
  const {
    redditNewsUI: { toggleMediaToTelegram },
  } = useRedditNewsStore();

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
