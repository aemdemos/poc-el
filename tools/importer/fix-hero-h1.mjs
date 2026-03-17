import fs from 'fs';
import path from 'path';

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
  let content = fs.readFileSync(file, 'utf8');
  // Replace "| # Title |" with "| <h1>Title</h1> |" in hero block cells
  content = content.replace(/\| # (.+?) \|/g, '| <h1>$1</h1> |');
  fs.writeFileSync(file, content, 'utf8');
  console.log('OK:', path.basename(file));
}
