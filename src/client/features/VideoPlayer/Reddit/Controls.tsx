import { FC, MouseEventHandler } from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';

type Props = {
  onClick: MouseEventHandler;
};

const Controls: FC<Props> = ({ onClick }) => {
  return (
    <ButtonGroup>
      <Button icon="play" onClick={onClick} name="play" />
      <Button icon="stop" onClick={onClick} name="stop" />
      <Button icon="download" onClick={onClick} name="download" />
      <Button icon="clipboard" onClick={onClick} name="clipboard" />
      <Button icon="document-open" onClick={onClick} name="open" />
    </ButtonGroup>
  );
};

export default Controls;
