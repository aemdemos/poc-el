import fs from 'fs';

// Pages with their hero titles from the original Lumen site
const pages = [
  {
    file: '/workspace/content/en-us/about/legal/trust-center/trust-and-safety-third-party-faqs.md',
    title: 'Lumen Trust & Safety Faqs For Third‑Party Requestors',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/trust-and-safety-customer-faqs.md',
    title: 'Lumen Trust & Safety FAQs for Customers',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/trust-and-safety-agency-faqs.md',
    title: 'Lumen Trust & Safety FAQs for Agencies',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/trust-and-safety.md',
    title: 'Lumen Trust and Safety',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/transparency-reports.md',
    title: 'Transparency Report',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/security-and-compliance/compliance-and-audit.md',
    title: 'Compliance and Audit',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/security-and-compliance.md',
    title: 'Security & Compliance',
  },
  {
    file: '/workspace/content/en-us/about/legal/trust-center/processing-lumen-services.md',
    title: 'Processing Details and Lumen Privacy Data Sheets',
  },
  {
    file: '/workspace/content/en-us/about/legal/privacy-center.md',
    title: 'Lumen Legal',
  },
  {
    file: '/workspace/content/en-us/about/legal/california.md',
    title: 'Lumen Legal',
  },
  {
    file: '/workspace/content/en-us/about/legal/business-customer-terms-conditions/security-log-monitoring-supplemental-terms.md',
    title: 'Security Log Monitoring',
  },
];

for (const page of pages) {
  const content = fs.readFileSync(page.file, 'utf8');

  // Check if hero already exists
  if (content.includes('| Hero |')) {
    console.log(`SKIP: ${page.file} (hero already exists)`);
    continue;
  }

  // The hero block goes BEFORE the Tabs Legal block
  // Build the hero section
  const heroSection = [
    '| Hero |',
    '| --- |',
    `| # ${page.title} |`,
    '',
    '| Section Metadata | |',
    '| --- | --- |',
    '| style | legal-hero |',
    '---',
    '',
  ].join('\n');

  // Insert the hero section before the Tabs Legal block
  const newContent = heroSection + content;

  fs.writeFileSync(page.file, newContent, 'utf8');
  console.log(`OK: ${page.file}`);
}

console.log(`\nDone! ${pages.length} pages processed.`);
