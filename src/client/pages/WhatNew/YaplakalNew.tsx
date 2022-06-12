import type { FC } from 'react';
import { useMemo } from 'react';

import { RootMediaNewsStoreContext, RootMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import YaplakalNewContainer from './YaplakalNewContainer';

const YaplakalNew: FC = () => {
  const providerValue = useMemo(() => new RootMediaNewsStore(), []);

  return (
    <RootMediaNewsStoreContext.Provider value={providerValue}>
      <YaplakalNewContainer />
    </RootMediaNewsStoreContext.Provider>
  );
};

export default YaplakalNew;
