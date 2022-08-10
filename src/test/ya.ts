import https from 'https';
import { rm, writeFile, readFile } from 'fs/promises';
import type { HTMLElement } from 'node-html-parser';
import { parse } from 'node-html-parser';

import { getMediaFromTopic, getPageInfo } from '../lib/yaplakal';

async function test() {
  const html = await readFile('topic.html', { encoding: 'utf8' });
  const rootPage = parse(html);
  const r = await getPageInfo(rootPage);
  await writeFile('topic.json', JSON.stringify(r), { encoding: 'utf8' });
}

test();
