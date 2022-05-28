import type { FC } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Checkbox } from '@blueprintjs/core';

import type { FormState } from './FormSettings';
import styles from './LoadResponsePreview.module.css';

const LoadResponsePreview: FC = () => {
  const { control } = useFormContext<FormState>();
  return (
    <div className={styles.margin}>
      <Controller
        name="loadResponsePreview"
        control={control}
        render={({ field: { ref, value, ...props } }) => {
          return (
            <Checkbox
              inputRef={ref}
              checked={value}
              label="Постараться скачивать адаптивный предпросмотр"
              {...props}
            />
          );
        }}
      />
    </div>
  );
};

export default LoadResponsePreview;
