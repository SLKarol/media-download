import type { MouseEventHandler } from 'react';
import { useState, useEffect, useRef, useTransition } from 'react';
import clsx from 'clsx';
import { Button } from '@blueprintjs/core';

import { MediaAlbum } from '@/types/media';

import styles from './index.module.css';

type Props = {
  collection: MediaAlbum;
};

/**
 * Показать медиа-коллекцию (альбом)
 */
function MediaCollection({ collection }: Props) {
  const refContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();
  const [widthImgContainer, setWidthImgContainer] = useState(0);
  useEffect(() => {
    setWidthImgContainer(refContainer.current.clientWidth);
  }, [refContainer.current]);

  // Следить за изменениями размера окна
  useEffect(() => {
    const resizeListener = () => {
      startTransition(() => {
        setWidthImgContainer(refContainer.current.clientWidth);
      });
    };
    // set resize listener
    window.addEventListener('resize', resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const keys = Object.keys(collection);

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const step = e.currentTarget.getAttribute('data-step');
    let newValue = 0;
    if (step === 'forward') {
      newValue = currentImgIndex + 1;
    } else {
      newValue = currentImgIndex - 1;
    }
    setCurrentImgIndex(newValue);
  };
  const styleList = { transform: `translateX(-${widthImgContainer * currentImgIndex}px)` };

  return (
    <div className={styles.container} ref={refContainer}>
      <Button
        icon="step-backward"
        className={clsx(styles.button, styles.buttonLeft)}
        onClick={onClick}
        data-step="backward"
        disabled={!currentImgIndex}
      />
      <ul className={styles.ul} style={styleList}>
        {keys.map((key) => (
          <li key={key}>
            <img src={collection[key].data} alt="" style={{ width: `${widthImgContainer}px` }} />
          </li>
        ))}
      </ul>
      <Button
        icon="step-forward"
        className={clsx(styles.button, styles.buttonRight)}
        data-step="forward"
        onClick={onClick}
        disabled={currentImgIndex === keys.length - 1}
      />
    </div>
  );
}

export default MediaCollection;
