import type { FC, ReactNode } from 'react';

function escapeRegExpChars(text: string) {
  // eslint-disable-next-line no-useless-escape
  return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

interface Props {
  text: string;
  query: string;
}

/**
 * Текст с выделенными буквами
 */
const HighlightText: FC<Props> = ({ text, query }) => {
  let lastIndex = 0;
  const words = query
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map(escapeRegExpChars);
  if (words.length === 0) {
    return <>{[text]}</>;
  }
  const regexp = new RegExp(words.join('|'), 'gi');
  const tokens: ReactNode[] = [];
  // eslint-disable-next-line no-constant-condition

  while (true) {
    const match = regexp.exec(text);
    if (!match) {
      break;
    }
    const { length } = match[0];
    const before = text.slice(lastIndex, regexp.lastIndex - length);
    if (before.length > 0) {
      tokens.push(before);
    }
    lastIndex = regexp.lastIndex;
    tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
  }
  const rest = text.slice(lastIndex);
  if (rest.length > 0) {
    tokens.push(rest);
  }

  return <>{tokens}</>;
};

export default HighlightText;
