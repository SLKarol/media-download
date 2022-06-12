import type { FC } from 'react';
import { useMemo } from 'react';

import { RootMediaNewsStoreContext, RootMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import RedditNewContainer from './RedditNewContainer';

const RedditNew: FC = () => {
  const providerValue = useMemo(() => new RootMediaNewsStore(), []);

  return (
    <RootMediaNewsStoreContext.Provider value={providerValue}>
      <RedditNewContainer />
    </RootMediaNewsStoreContext.Provider>
  );
};

export default RedditNew;
