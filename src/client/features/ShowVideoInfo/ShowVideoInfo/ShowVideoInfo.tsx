import type { FunctionComponent, MouseEventHandler } from 'React';
import { useEffect } from 'react';
import { H5, Classes, Card, Elevation, Collapse } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import VideoActions from '@client/components/VideoActions';
import { useRootStore } from '@client/mobxStore/root';
import Description from './Description';
import VideoPreviewComponent from '../VideoPreview';
import styles from './ShowVideoInfo.module.css';
import { MediaActions } from '@/client/constants/mediaActions';
import { TypeMedia } from '@/constants/media';

const { ipcRenderer } = window.electron;
interface Props {
  isOpen: boolean;
}

const ShowVideoInfo: FunctionComponent<Props> = ({ isOpen }) => {
  const {
    uiState: { appBusy, oneVideoDisabled, setAppBusy },
    videoInfo: {
      videoDescription: {
        title,
        haveVideo,
        id,
        idVideoSource,
        subtitles,
        hasChapters,
        videoFormats,
      },
      setInfo,
      onClickAction,
      setMediaPreview,
      onClickDownloadYouTube,
      setMediaCollection,
    },
  } = useRootStore();

  useEffect(() => {
    ipcRenderer.receiveVideoInfo((_, value) => {
      setAppBusy(false);
      setInfo(value);
    });
    ipcRenderer.receiveMediaPreview((_, param) => {
      setMediaPreview(param);
    });
    ipcRenderer.getMediaCollection((_, data) => setMediaCollection(data));
  }, []);

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const { currentTarget } = e;
    const action = currentTarget.getAttribute('data-action');
    const youtube = currentTarget.getAttribute('data-youtube');
    if (!youtube) onClickAction(action as MediaActions);
    if (youtube === '1') {
      const youtubeMedia = currentTarget.getAttribute('data-youtube-media') as TypeMedia;
      const youtubeSubtitle = currentTarget.getAttribute('data-youtube-subtitle');
      const youtubeSubtitleType = currentTarget.getAttribute('data-youtube-subtitle-type');
      const youtubeSubtitleLanguageCode = currentTarget.getAttribute(
        'data-youtube-subtitle-language-code',
      );
      const videoQuality = currentTarget.getAttribute('data-video-quality');

      onClickDownloadYouTube({
        media: youtubeMedia,
        subtitle: youtubeSubtitle,
        subtitleType: youtubeSubtitleType,
        subtitleLanguageCode: youtubeSubtitleLanguageCode,
        videoQuality,
      });
    }
  };

  return (
    <Collapse isOpen={isOpen}>
      <Card elevation={Elevation.ONE} className={styles.component}>
        <H5 className={clsx(styles.oneColumn, appBusy && Classes.SKELETON)}>{title}</H5>
        <VideoPreviewComponent />
        <Description />
        {!appBusy && haveVideo && (
          <VideoActions
            disabled={oneVideoDisabled}
            idMedia={id}
            idVideoSource={idVideoSource}
            className={styles.oneColumn}
            onClick={onClick}
            subtitles={subtitles}
            hasChapters={hasChapters}
            videoFormats={videoFormats}
          />
        )}
      </Card>
    </Collapse>
  );
};

export default observer(ShowVideoInfo);
