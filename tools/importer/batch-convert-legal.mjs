import fs from 'fs';
import path from 'path';

// Import the same conversion pipeline as the hook
const hooksDir = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/hooks';
const conversionToolsPath = path.join(hooksDir, '../tools/excatops-mcp/src/tools/conversion-tools.js');
const { conversionTools } = await import(conversionToolsPath);
const convertMarkdownToHtml = conversionTools[0].handler;
const { buildFullHtml } = await import(path.join(hooksDir, 'html-utils.js'));

// Find all .md files recursively
function findMdFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(findMdFiles(fp));
    else if (entry.name.endsWith('.md')) results.push(fp);
  }
  return results;
}

const files = [
  '/workspace/content/en-us/about/legal.md',
  ...findMdFiles('/workspace/content/en-us/about/legal'),
];

let ok = 0;
let fail = 0;

for (const file of files) {
  const md = fs.readFileSync(file, 'utf8');
  const result = await convertMarkdownToHtml({ markdown: md, baseUrl: null, wrapInBody: false });
  if (!result.success) {
    console.error('FAIL:', file, result.error);
    fail++;
    continue;
  }

  // Write .plain.html
  const plainPath = file.replace(/\.md$/, '.plain.html');
  fs.writeFileSync(plainPath, result.htmlContent, 'utf8');

  // Write .html (full)
  const fullHtml = buildFullHtml(result.htmlContent, { filePath: file, logger: () => {} });
  fs.writeFileSync(file.replace(/\.md$/, '.html'), fullHtml, 'utf8');
  ok++;
}

console.log(`Converted: ${ok} | Failed: ${fail}`);
