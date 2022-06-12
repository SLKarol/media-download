import type { FC } from 'react';
import { H5 } from '@blueprintjs/core';

import styles from './index.module.css';
import SelectYaForum from './SelectYaForum';
import ButttonGetYapNews from './ButttonGetYapNews';

const YaPlakalNewsToolbar: FC = () => {
  return (
    <>
      <H5 className={styles.title}>Новые записи из избранных форумов yaplakal</H5>
      <div className={styles.toolbar}>
        <SelectYaForum />
        <ButttonGetYapNews />
      </div>
    </>
  );
};

export default YaPlakalNewsToolbar;
