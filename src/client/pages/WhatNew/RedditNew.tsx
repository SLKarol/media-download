import type { FC } from 'react';
import { useMemo } from 'react';

import { RootRedditNewsStore, RootRedditNewsStoreContext } from '@client/mobxStore/redditNews';
import RedditNewContainer from './RedditNewContainer';

const RedditNew: FC = () => {
  const providerValue = useMemo(() => new RootRedditNewsStore(), []);

  return (
    <RootRedditNewsStoreContext.Provider value={providerValue}>
      <RedditNewContainer />
    </RootRedditNewsStoreContext.Provider>
  );
};

export default RedditNew;
