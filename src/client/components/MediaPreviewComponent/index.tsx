import type { FC } from 'react';
import { useRef, useEffect, useState, useDeferredValue } from 'react';

import type { MediaPreview } from '@/types/media';

import styles from './index.module.css';

interface Props {
  previewImages: MediaPreview;
  title: string;
}
function getImage(preview: MediaPreview, clientWidth: number) {
  // Если нет вариантов, то выдать обычный превью
  const { decoded, resolutions } = preview;
  if (!resolutions) return decoded;
  // Найти подходящий размер
  const adaptive = preview.resolutions.find((r) => r.width > clientWidth);
  if (adaptive) return adaptive.decoded;
  return decoded;
}

const MediaPreviewComponent: FC<Props> = ({ previewImages, title }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState('');
  const clientImage = useDeferredValue(imgSrc);

  useEffect(() => {
    // Подсчёт размеров контейнера картинки
    const handleResize = () => {
      const { clientWidth } = divRef.current;
      setImgSrc(getImage(previewImages, clientWidth));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={divRef}>
      <img src={clientImage} alt={title} className={styles.img} />
    </div>
  );
};

export default MediaPreviewComponent;
