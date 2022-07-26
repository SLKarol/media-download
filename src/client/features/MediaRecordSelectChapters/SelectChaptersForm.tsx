import type { FC } from 'react';
import type { Chapter } from 'ytdl-core';
import { Button, Checkbox, Classes, Switch } from '@blueprintjs/core';
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form';

import type { FormDataSelectChapters } from '@/types/downloader';
import styles from './SelectChaptersForm.module.css';
import { formatSeconds } from '@/client/lib/date';

interface Props {
  chapters: Chapter[];
  // eslint-disable-next-line no-unused-vars
  onDownloadChapters: (params: FormDataSelectChapters) => void;
  onCancel: () => void;
}

const SelectChaptersForm: FC<Props> = ({ chapters, onCancel, onDownloadChapters }) => {
  const { handleSubmit, control } = useForm<FormDataSelectChapters>({
    defaultValues: {
      selectedChapters: chapters.map((c) => ({ ...c, select: false })),
      selectAll: true,
      deleteSourceAfterWork: true,
    },
  });
  const { fields } = useFieldArray({
    name: 'selectedChapters',
    control,
  });

  const selectAll = useWatch({ name: 'selectAll', control });
  const selectedChapters = useWatch({ name: 'selectedChapters', control });
  const disableSubmit = !selectAll && !selectedChapters.some((s) => s.select);

  return (
    <div>
      <div className="bp4-running-text .modifier">
        Видео/аудио ресурс <strong>полностью скачивается</strong>, затем при помощи{' '}
        <strong>ffmpeg</strong> разбивается на части.
      </div>
      <form onSubmit={handleSubmit(onDownloadChapters)} className={styles.form}>
        <Controller
          name="deleteSourceAfterWork"
          control={control}
          render={({ field: { ref, value, ...p } }) => {
            return (
              <Switch
                inputRef={ref}
                label="Удалить исходный файл после обработки"
                checked={value}
                {...p}
              />
            );
          }}
        />

        <div className={styles.containerCheckboxes}>
          <Controller
            name="selectAll"
            control={control}
            render={({ field: { ref, value, ...p } }) => {
              return <Checkbox inputRef={ref} label="Выбрать всё" checked={value} {...p} />;
            }}
          />
          <Controller
            name="onlyAudio"
            control={control}
            render={({ field: { ref, value, ...p } }) => {
              return <Switch inputRef={ref} label="Скачать только аудио" checked={value} {...p} />;
            }}
          />
        </div>
        <div className={styles.listChapters}>
          {fields.map((field, index) => {
            return (
              <Controller
                key={field.id}
                control={control}
                name={`selectedChapters.${index}.select`}
                render={({ field: { ref, value, ...p } }) => (
                  <Checkbox
                    inputRef={ref}
                    label={`${formatSeconds(field.start_time)} ${field.title}`}
                    checked={value}
                    disabled={selectAll}
                    {...p}
                  />
                )}
              />
            );
          })}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="submit" disabled={disableSubmit} icon="download" intent="primary">
              Скачать
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SelectChaptersForm;
