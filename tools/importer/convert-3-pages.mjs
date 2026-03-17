import fs from 'fs';
import path from 'path';
import { marked } from '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/tools/excatops-mcp/node_modules/marked/lib/marked.esm.js';
import { buildFullHtml } from '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/hooks/html-utils.js';

const files = [
  '/workspace/content/en-us/about/legal/trust-center/trust-and-safety-third-party-faqs.md',
  '/workspace/content/en-us/about/legal/trust-center/trust-and-safety-customer-faqs.md',
  '/workspace/content/en-us/about/legal/trust-center/trust-and-safety-agency-faqs.md',
  '/workspace/content/en-us/about/legal/trust-center/trust-and-safety.md',
  '/workspace/content/en-us/about/legal/trust-center/transparency-reports.md',
  '/workspace/content/en-us/about/legal/trust-center/security-and-compliance/compliance-and-audit.md',
  '/workspace/content/en-us/about/legal/trust-center/security-and-compliance.md',
  '/workspace/content/en-us/about/legal/trust-center/processing-lumen-services.md',
  '/workspace/content/en-us/about/legal/privacy-center.md',
  '/workspace/content/en-us/about/legal/california.md',
  '/workspace/content/en-us/about/legal/business-customer-terms-conditions/security-log-monitoring-supplemental-terms.md',
];

for (const file of files) {
  const md = fs.readFileSync(file, 'utf8');
  const htmlContent = await marked.parse(md);

  // Write .plain.html
  const plainPath = file.replace(/\.md$/, '.plain.html');
  fs.writeFileSync(plainPath, htmlContent, 'utf8');

  // Write .html (full EDS wrapper)
  const fullHtml = buildFullHtml(htmlContent, { filePath: file, logger: () => {} });
  fs.writeFileSync(file.replace(/\.md$/, '.html'), fullHtml, 'utf8');

  console.log('OK:', path.basename(file));
}
