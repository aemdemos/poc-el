import fs from 'fs';

const file = '/workspace/content/en-us/about/legal/business-customer-terms-conditions.md';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Helper: strip leading "- " from a line and trim
function stripBullet(line) {
  return line.replace(/^- /, '').trim();
}

// Helper: build accordion table from items array [{label, links}]
function buildAccordion(items) {
  const colCount = 2;
  const rows = [`| Accordion | |`, `| --- | --- |`];
  for (const item of items) {
    // Join links with <br>, escape any pipe chars in content
    const cellContent = item.links.map(l => l.replace(/\|/g, '\\|')).join('<br>');
    rows.push(`| ${item.label} | ${cellContent} |`);
  }
  return rows;
}

const result = [];
let i = 0;

// --- Phase 1: Process up to and including the intro text ---
// Copy lines until we hit the MSA bullet lists (line index 20, file line 21)
while (i < lines.length) {
  const line = lines[i];

  // Detect start of MSA links: first bullet after the intro text
  if (line.startsWith('- [Lumen Master Service Agreement]') && lines[i - 2]?.includes('Legacy Company Documents')) {
    break;
  }
  result.push(line);
  i++;
}

// --- Phase 2: Build Agreements Accordion ---
// Collect MSA links (group 1: until blank line)
const msaLinks = [];
while (i < lines.length && lines[i].trim() !== '') {
  msaLinks.push(stripBullet(lines[i]));
  i++;
}

// Skip blank line between groups
if (lines[i]?.trim() === '') i++;

// Collect MSA-APAC links (group 2: until blank line)
const msaApacLinks = [];
while (i < lines.length && lines[i].trim() !== '') {
  msaApacLinks.push(stripBullet(lines[i]));
  i++;
}

// Build accordion
const agreementsAccordion = buildAccordion([
  { label: 'Master Service Agreements', links: msaLinks },
  { label: 'Master Service Agreements - APAC', links: msaApacLinks },
]);

result.push('');
result.push(...agreementsAccordion);
result.push('');

console.log(`Agreements accordion: ${msaLinks.length} MSA links, ${msaApacLinks.length} APAC links`);

// --- Phase 3: Copy Service Schedules and Service Guides as-is until SLAs ---
while (i < lines.length) {
  const line = lines[i];

  // Detect the SLA section heading
  if (line === '**Service Level Agreements**') {
    result.push(line);
    result.push('');
    i += 2; // skip heading + blank line
    break;
  }
  result.push(line);
  i++;
}

// --- Phase 4: Build SLAs Accordion ---
// Group 1: Current Lumen Services (lines start with "- [" until blank line)
const slaCurrentLinks = [];
while (i < lines.length && lines[i].trim() !== '') {
  slaCurrentLinks.push(stripBullet(lines[i]));
  i++;
}

// Skip blank line
if (lines[i]?.trim() === '') i++;

// Group 2: QC Services (until blank line)
const slaQcLinks = [];
while (i < lines.length && lines[i].trim() !== '') {
  slaQcLinks.push(stripBullet(lines[i]));
  i++;
}

// Skip blank line
if (lines[i]?.trim() === '') i++;

// Group 3: End of Sale Lumen Services (until blank line)
const slaEosLinks = [];
while (i < lines.length && lines[i].trim() !== '') {
  slaEosLinks.push(stripBullet(lines[i]));
  i++;
}

// Build SLA accordion
const slaAccordion = buildAccordion([
  { label: 'Current Lumen Services', links: slaCurrentLinks },
  { label: 'QC Services (Retail and Wholesale)', links: slaQcLinks },
  { label: 'End of Sale Lumen Services', links: slaEosLinks },
]);

result.push(...slaAccordion);
result.push('');

console.log(`SLAs accordion: ${slaCurrentLinks.length} current, ${slaQcLinks.length} QC, ${slaEosLinks.length} EoS links`);

// --- Phase 5: Copy remainder (Small Business + Section Metadata + Metadata) ---
while (i < lines.length) {
  result.push(lines[i]);
  i++;
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log('Done! business-customer-terms-conditions.md updated with accordion blocks.');
