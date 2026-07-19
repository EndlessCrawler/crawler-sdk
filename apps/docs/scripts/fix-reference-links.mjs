// Post-gen link normalizer for the typedoc output (runs after `typedoc` in
// `gen:reference`). The plugin emits file-path links (`…/Chamber.mdx`,
// `…/index.mdx#anchor`); vocs strips the extension on plain links but not on
// anchored ones, so normalize every link to its final route form here:
//   …/index.mdx → …/     ·   …/Page.mdx → …/Page   (with or without #anchor)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/pages/reference', import.meta.url).pathname;

const mdxFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return mdxFiles(path);
    return entry.name.endsWith('.mdx') ? [path] : [];
  });

let changed = 0;
for (const file of mdxFiles(root)) {
  const source = readFileSync(file, 'utf8');
  const fixed = source
    .replaceAll('/index.mdx#', '/#')
    .replaceAll('/index.mdx)', '/)')
    .replaceAll('.mdx#', '#')
    .replaceAll('.mdx)', ')');
  if (fixed !== source) {
    writeFileSync(file, fixed);
    changed++;
  }
}
console.log(`fix-reference-links: normalized links in ${changed} files`);
