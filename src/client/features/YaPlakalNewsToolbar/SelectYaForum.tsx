import type { FC } from 'react';
import { MenuItem, Button } from '@blueprintjs/core';
import { ItemRenderer, Select2 } from '@blueprintjs/select';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '@client/mobxStore/root';
import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import HighlightText from '@/client/components/HighlightText';
import type { MediaForum } from '@/types/mediaForum';

const YaPlakalForumSelect = Select2.ofType<MediaForum>();

export const renderForum: ItemRenderer<MediaForum> = (
  forum,
  { handleClick, handleFocus, modifiers, query },
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={forum.description}
      key={forum.url}
      onClick={handleClick}
      onFocus={handleFocus}
      text={<HighlightText text={forum.description} query={query} />}
    />
  );
};

const SelectYaForum: FC = () => {
  const {
    settingsStore: { yaPlakalForums },
    uiState: { appBusy },
  } = useRootStore();

  const {
    mediaNewsUI: { setSelectedForum, selectedForum },
  } = useMediaNewsStore();

  const selectedText = selectedForum ? selectedForum.description : '(Не выбрано)';

  return (
    <YaPlakalForumSelect
      items={yaPlakalForums}
      itemRenderer={renderForum}
      onItemSelect={setSelectedForum}
      filterable={false}
      disabled={appBusy}>
      <Button text={selectedText} />
    </YaPlakalForumSelect>
  );
};

export default observer(SelectYaForum);
