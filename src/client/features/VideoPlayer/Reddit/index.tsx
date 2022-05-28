import { FunctionComponent, useRef } from 'react';
import Controls from './Controls';

import styles from './index.module.css';

interface Props {
  urlVideo: string;
  urlAudio?: string;
  previewImage?: string;
}

function getVideoProps(url: string, previewImage?: string) {
  const re: { type?: string; poster?: string } = {};
  if (url.endsWith('endsWith')) {
    re.type = 'video/mp4';
  }
  if (previewImage) {
    re.poster = previewImage;
  }
  return re;
}

const VideoPlayerReddit: FunctionComponent<Props> = ({ urlVideo, urlAudio, previewImage }) => {
  const videoRef = useRef<HTMLVideoElement>();
  const audioRef = useRef<HTMLAudioElement>();
  const linkRef = useRef<HTMLAnchorElement>();
  return (
    <div className={styles.container}>
      <video {...getVideoProps(urlVideo, previewImage)} className={styles.video} ref={videoRef}>
        <source src={urlVideo} />
      </video>
      {urlAudio && (
        <audio ref={audioRef}>
          <source src={urlAudio} type="audio/mpeg" />
        </audio>
      )}
      <Controls onClick={(e) => console.log(e)} />
      <a href="#" ref={linkRef} className={styles.hideLink}>
        Ссылка
      </a>
    </div>
  );
};

export default VideoPlayerReddit;
