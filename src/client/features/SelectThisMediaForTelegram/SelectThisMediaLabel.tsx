import type { FC } from 'react';
import clsx from 'clsx';

import styles from './SelectThisMediaLabel.module.css';

interface Props {
  unSupportTelegram?: boolean;
}

const SelectThisMediaLabel: FC<Props> = ({ unSupportTelegram }) => {
  return (
    <span className={clsx(unSupportTelegram && styles.warning)}>Добавить в список рассылки</span>
  );
};

export default SelectThisMediaLabel;
