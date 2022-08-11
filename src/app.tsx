import { createRoot } from 'react-dom/client';
import { MemoryRouter as Router } from 'react-router-dom';

import App from '@client/components/Main';

import { RootStoreContext, RootStore } from '@client/mobxStore/root';

// eslint-disable-next-line react/jsx-no-constructed-context-values
const rootStore = new RootStore();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <RootStoreContext.Provider value={rootStore}>
    <Router>
      <App />
    </Router>
  </RootStoreContext.Provider>,
);
