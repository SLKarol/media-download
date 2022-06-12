import type { FC, MouseEventHandler } from 'react';
import { observer } from 'mobx-react-lite';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import YaPlakalForumHeader from './YaPlakalForumHeader';

/**
 * Список форумов в выбранном разделе
 */
const YaPlakalListForums: FC = () => {
  const {
    listForums: { arrayForums },
    mediaNewsUI: { setSelectedTopic },
  } = useMediaNewsStore();

  const onClickLink: MouseEventHandler<HTMLAnchorElement> = (e) => {
    setSelectedTopic({
      href: e.currentTarget.getAttribute('data-href'),
      name: e.currentTarget.getAttribute('data-name'),
    });
  };

  return (
    <div>
      {arrayForums.map((forum) => (
        <YaPlakalForumHeader key={forum.href} onClickLink={onClickLink} {...forum} />
      ))}
    </div>
  );
};

export default observer(YaPlakalListForums);
