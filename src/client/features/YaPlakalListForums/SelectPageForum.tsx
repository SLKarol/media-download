import type { FC } from 'react';
import { useState } from 'react';
import { Button, NumericInput } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';

import styles from './SelectPageForum.module.css';

interface Props {
  href: string;
  countPages: number;
}

const SelectPageForum: FC<Props> = ({ href, countPages }) => {
  const [page, setPage] = useState<number | null>(null);
  const navigate = useNavigate();

  const onClick = () => {
    // Разбить на части урл
    const hrefArray = href.split('/');
    const topicLink = `${hrefArray[0]}/st/${25 * (page - 1)}/${hrefArray[1]}`;
    navigate(`?href=${topicLink}`);
  };

  return (
    <div className={styles.component}>
      <NumericInput
        placeholder="Перейти на страницу..."
        min={1}
        max={countPages}
        value={page}
        onValueChange={setPage}
      />
      <Button
        text="Перейти"
        className={styles.button}
        disabled={!page || page > countPages || page < 1}
        onClick={onClick}
      />
    </div>
  );
};

export default SelectPageForum;
