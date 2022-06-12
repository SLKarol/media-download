import type { FC } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Card, H5, InputGroup, Elevation, ControlGroup, Button } from '@blueprintjs/core';

import type { FormStateSettings } from '@/types/settings';
import styles from './index.module.css';

const YaPlakal: FC = () => {
  const { control } = useFormContext<FormStateSettings>();
  const { append, fields, remove } = useFieldArray({ control, name: 'yapForums' });

  const deleteForum = (indexForum: number) => {
    remove(indexForum);
  };

  return (
    <Card elevation={Elevation.ONE} className={styles.marginTop}>
      <H5>Настройки Yaplakal</H5>
      <Button
        icon="add"
        onClick={() => {
          append({ description: '', url: '' });
        }}
      />
      {fields.map((item, indx) => (
        <ControlGroup fill className={styles.controlGroup}>
          <ControlGroup fill>
            <Controller
              name={`yapForums.${indx}.url`}
              control={control}
              render={({ field: { ref, ...p } }) => {
                return <InputGroup inputRef={ref} {...p} placeholder="Адрес форума" />;
              }}
            />
            <Controller
              name={`yapForums.${indx}.description`}
              control={control}
              render={({ field: { ref, ...p } }) => {
                return <InputGroup inputRef={ref} {...p} placeholder="Название форума" />;
              }}
            />
          </ControlGroup>
          <Button icon="delete" onClick={() => deleteForum(indx)} minimal />
        </ControlGroup>
      ))}
    </Card>
  );
};

export default YaPlakal;
