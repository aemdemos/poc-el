import fs from 'fs';

// Patterns that indicate sidebar nav content (not body content)
const sidebarPatterns = [
  /^\[Lumen Platform Agreement\]\(\/en-us\/about\/legal\/digital-platform\.html\)$/,
  /^Lumen Privacy$/,
  /^- \[Privacy Notice\]/,
  /^- \[Privacy Center\]/,
  /^\[Service Attachments\]/,
  /^- \[Lumen Network-as-a-Service/,
  /^- \[Lumen DDoS Essentials\]/,
  /^\[Prior Versions Lumen Platform Agreement\]/,
  /^\[Prior Versions Service Attachments\]/,
  /^\[Lumen Platform Agreement FAQ\]/,
  /^Promotions$/,
  /^- \[A Month Free of IP VPN/,
  /^- \[IP VPN On-Demand First Month Free\]/,
];

// Patterns that indicate footer content
const footerPatterns = [
  /^\[About Us\]\(\/en-us\/about\.html\)/,
  /^© 20\d\d Lumen Technologies/,
  /^Cookie Settings/,
];

function isSidebar(block) {
  const lines = block.split('\n');
  return lines.some(line => sidebarPatterns.some(p => p.test(line.trim())));
}

function isFooter(block) {
  const lines = block.split('\n');
  return lines.some(line => footerPatterns.some(p => p.test(line.trim())));
}

const files = [
  '/workspace/content/en-us/about/legal/digital-platform/historical/july172023.md',
  '/workspace/content/en-us/about/legal/digital-platform/historical/feb202024.md',
  '/workspace/content/en-us/about/legal/digital-platform/historical/nov232020.md',
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Split into blocks by double newline
  const blocks = content.split(/\n\n/);

  const seen = new Set();
  const kept = [];
  let removedDuplicates = 0;
  let removedSidebar = 0;
  let removedFooter = 0;

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Skip sidebar nav
    if (isSidebar(trimmed)) {
      removedSidebar++;
      continue;
    }

    // Skip footer
    if (isFooter(trimmed)) {
      removedFooter++;
      continue;
    }

    // Skip duplicates (use first 100 chars as key to handle minor whitespace diffs)
    const key = trimmed.substring(0, 100).replace(/\s+/g, ' ');
    if (seen.has(key)) {
      removedDuplicates++;
      continue;
    }
    seen.add(key);

    kept.push(block);
  }

  // Rejoin with double newlines
  const cleaned = kept.join('\n\n') + '\n';

  fs.writeFileSync(file, cleaned, 'utf8');

  const basename = file.split('/').pop();
  console.log(`${basename}: kept ${kept.length} blocks, removed ${removedDuplicates} dupes, ${removedSidebar} sidebar, ${removedFooter} footer`);
}
