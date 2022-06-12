import type { FC, MouseEventHandler } from 'react';
import { Card, Elevation, H5 } from '@blueprintjs/core';
import { Link } from 'react-router-dom';

import type { MediaForumProperties } from '@/types/mediaForum';
import SelectPageForum from './SelectPageForum';

interface Props extends MediaForumProperties {
  onClickLink: MouseEventHandler<HTMLAnchorElement>;
}

const YaPlakalForumHeader: FC<Props> = ({ countPages, created, href, name, onClickLink }) => {
  return (
    <Card elevation={Elevation.ONE}>
      <H5>
        <Link to={`?href=${href}`} onClick={onClickLink} data-href={href} data-name={name}>
          {name}
        </Link>
      </H5>
      <p>{created}</p>
      <p>{`Страниц на форуме: ${countPages}`}</p>
      {countPages > 1 ? <SelectPageForum href={href} countPages={countPages} /> : null}
    </Card>
  );
};

export default YaPlakalForumHeader;
