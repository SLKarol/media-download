/* eslint-disable camelcase */
import type { FC } from 'react';
import { Icon, Intent } from '@blueprintjs/core';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';

interface Props {
  icon: 'video' | 'audio' | 'subtitle' | 'picture';
}

const IconWhatDownload: FC<Props> = ({ icon }) => {
  let iconProp: BlueprintIcons_16Id;
  let intent: Intent;
  if (icon === 'video') {
    iconProp = 'video';
    intent = Intent.PRIMARY;
  }
  if (icon === 'audio') {
    iconProp = 'music';
    intent = Intent.SUCCESS;
  }
  if (icon === 'subtitle') {
    iconProp = 'font';
  }
  if (icon === 'picture') {
    iconProp = 'media';
    intent = Intent.SUCCESS;
  }

  return <Icon icon={iconProp} intent={intent} />;
};

export default IconWhatDownload;
