import type { FC } from 'react';
import { NonIdealState } from '@blueprintjs/core';

interface Props {
  loading: boolean;
}

const NotPreview: FC<Props> = ({ loading }) => {
  return <NonIdealState icon={loading ? 'search' : 'disable'} />;
};

export default NotPreview;
