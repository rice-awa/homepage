import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const worksSource = await readFile(
  new URL('../src/components/Works.tsx', import.meta.url),
  'utf8',
);

test('makes each work cover a link to the project', () => {
  assert.match(
    worksSource,
    /<a\s+className="work-cover-link"\s+href=\{item\.link\}\s+target="_blank"\s+rel="noopener"\s+data-cursor="view"\s+aria-label=\{`查看 \$\{item\.name\} 项目`\}/,
  );
  assert.doesNotMatch(
    worksSource,
    /<article className="work-card" data-cursor="view">/,
  );
});
