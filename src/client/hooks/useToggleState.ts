import { useState } from 'react';

/**
 * Хук используется для работы с булевым состоянием.
 * Создан из желания сделать оптимальный рендер компоненты,
 * избежав анонимной ф-ции смены состояния, которая передастся в дочерние компоненты.
 * @return инициализированное состояние и ф-цию переключения этого состояния.
 */
// eslint-disable-next-line no-unused-vars
export function useToggleState(init = false): [boolean, (value?: unknown) => void] {
  const [state, setState] = useState(init);
  /**
   * Можно принудительно передавать параметр состояния,
   * Если хотите его задать.
   */
  const toggleState = (toggleValue?: unknown) =>
    setState(typeof toggleValue === 'boolean' ? toggleValue : !state);
  return [state, toggleState];
}
