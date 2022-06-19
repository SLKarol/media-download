/* eslint-disable camelcase */
import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Select2 } from '@blueprintjs/select';
import { MenuItem, Button, Menu } from '@blueprintjs/core';
import type { ItemPredicate, ItemRenderer, ItemListRenderer } from '@blueprintjs/select';
import type { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';

import { useMediaNewsStore } from '@client/mobxStore/rootMediaNews';
import { useRootStore } from '@client/mobxStore/root';
import type { Subscribe } from '@/client/mobxStore/redditSubscribes';
import styles from './RedditNewsSelectSubscribe.module.css';
import HighlightText from '@/client/components/HighlightText';

const SubscribeSelect = Select2.ofType<Subscribe>();

const itemPredicate: ItemPredicate<Subscribe> = (query, subscribe, _index, exactMatch) => {
  const normalizedTitle = subscribe.id.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  }
  return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
};

const itemRenderer: ItemRenderer<Subscribe> = (
  subscribe,
  { handleClick, handleFocus, modifiers, query },
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={subscribe.id}
      onClick={handleClick}
      onFocus={handleFocus}
      label={subscribe.over18 && '18+'}
      text={<HighlightText text={subscribe.id} query={query} />}
    />
  );
};

const itemListRenderer: ItemListRenderer<Subscribe> = ({ items, itemsParentRef, renderItem }) => {
  const renderedItems = items.map(renderItem).filter((item) => item != null);
  return (
    <Menu ulRef={itemsParentRef} className={styles.menu}>
      <MenuItem disabled text={`Найдено ${renderedItems.length} записей.`} />
      {renderedItems}
    </Menu>
  );
};

const RedditNewsSelectSubscribe: FC = () => {
  const {
    redditSubscribeStore: { listSubscribes },
    mediaNewsUI: { setSelectedSubscribe, selectedSubscribe },
  } = useMediaNewsStore();
  const {
    uiState: { appBusy },
  } = useRootStore();

  const selectedText = selectedSubscribe ? selectedSubscribe.id : '(Не выбрано)';
  let icon: string | undefined;
  if (selectedSubscribe && selectedSubscribe.over18) {
    icon = 'flame';
  }

  return (
    <SubscribeSelect
      inputProps={{ placeholder: 'Найти канал' }}
      itemListRenderer={itemListRenderer}
      itemRenderer={itemRenderer}
      items={listSubscribes}
      itemPredicate={itemPredicate}
      onItemSelect={(item) => setSelectedSubscribe(item.id)}
      popoverProps={{
        usePortal: true,
      }}
      disabled={appBusy}>
      <Button text={selectedText} rightIcon={icon as unknown as BlueprintIcons_16Id} />
    </SubscribeSelect>
  );
};

export default observer(RedditNewsSelectSubscribe);
