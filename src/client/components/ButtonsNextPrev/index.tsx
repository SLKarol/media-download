import type { FC } from 'react';
import { Button } from '@blueprintjs/core';

import styles from './index.module.css';

interface Props {
  visibleSelectForum?: boolean;
  disabledSelectForum?: boolean;
  onClickUp?: () => void;
  disabledPrev: boolean;
  onClickPrev: () => void;
  disabledNext: boolean;
  onClickNext: () => void;
}

const ButtonsNextPrev: FC<Props> = ({
  visibleSelectForum,
  disabledSelectForum,
  onClickUp,
  disabledPrev,
  onClickPrev,
  disabledNext,
  onClickNext,
}) => {
  return (
    <div className={styles.component}>
      <Button
        icon="arrow-left"
        title="На предыдущую страницу топика"
        disabled={disabledPrev}
        onClick={onClickPrev}
      />
      {visibleSelectForum ? (
        <Button
          icon="arrow-up"
          title="К выбору форума"
          onClick={onClickUp}
          disabled={disabledSelectForum}
        />
      ) : null}
      <Button
        icon="arrow-right"
        title="На следующую страницу топика"
        disabled={disabledNext}
        onClick={onClickNext}
      />
    </div>
  );
};

export default ButtonsNextPrev;
