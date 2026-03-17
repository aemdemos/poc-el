import fs from 'fs';

const file = '/workspace/content/en-us/about/legal/state-privacy-rights.md';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// States in order, mapped to their "Effective" line numbers (1-based)
const states = [
  { name: 'California', effectiveLine: 17 },
  { name: 'Colorado', effectiveLine: 96 },
  { name: 'Connecticut', effectiveLine: 176 },
  { name: 'Delaware', effectiveLine: 246 },
  { name: 'Indiana', effectiveLine: 330 },
  { name: 'Iowa', effectiveLine: 416 },
  { name: 'Kentucky', effectiveLine: 475 },
  { name: 'Maryland', effectiveLine: 560 },
  { name: 'Minnesota', effectiveLine: 642 },
  { name: 'Montana', effectiveLine: 736 },
  { name: 'Nebraska', effectiveLine: 806 },
  { name: 'New Hampshire', effectiveLine: 877 },
  { name: 'New Jersey', effectiveLine: 949 },
  { name: 'Oregon', effectiveLine: 1021 },
  { name: 'Rhode Island', effectiveLine: 1106 },
  { name: 'Tennessee', effectiveLine: 1192 },
  { name: 'Texas', effectiveLine: 1276 },
  { name: 'Utah', effectiveLine: 1358 },
  { name: 'Virginia', effectiveLine: 1421 },
];

// Verify that each "Effective" line starts correctly
for (const state of states) {
  const line = lines[state.effectiveLine - 1]; // convert to 0-based
  if (!line.startsWith('**Effective')) {
    console.error(`ERROR: Line ${state.effectiveLine} for ${state.name} doesn't start with **Effective: "${line}"`);
    process.exit(1);
  }
}

// Find the end of the last state's content (just before Section Metadata)
const sectionMetaIdx = lines.findIndex(l => l.startsWith('| Section Metadata'));
console.log(`Section Metadata at line ${sectionMetaIdx + 1}`);

// Build the output
const result = [];

// 1. Intro section: lines 1-15 (Tabs Legal + heading + intro paragraph)
// Keep everything up to the blank line before California's content
const introEnd = states[0].effectiveLine - 2; // line 16 is blank, intro ends at line 15
for (let i = 0; i < introEnd; i++) {
  result.push(lines[i]);
}

// Add section metadata for the intro section
result.push('');
result.push('| Section Metadata | |');
result.push('| --- | --- |');
result.push('| style | legal |');

// 2. Each state gets its own section
for (let s = 0; s < states.length; s++) {
  const state = states[s];
  const startIdx = state.effectiveLine - 1; // 0-based index of "Effective" line
  const endIdx = s < states.length - 1
    ? states[s + 1].effectiveLine - 2 // blank line before next state
    : sectionMetaIdx - 1; // before Section Metadata (there may be blank lines)

  // Section break
  result.push('---');
  result.push('');

  // Add state heading
  result.push(`### ${state.name}`);
  result.push('');

  // Add state content (trimming trailing blank lines)
  let lastNonBlank = endIdx;
  while (lastNonBlank > startIdx && lines[lastNonBlank].trim() === '') lastNonBlank--;

  for (let i = startIdx; i <= lastNonBlank; i++) {
    result.push(lines[i]);
  }

  // Add accordion-item section metadata
  result.push('');
  result.push('| Section Metadata | |');
  result.push('| --- | --- |');
  result.push('| style | accordion-item |');
}

// 3. Final section break and metadata
result.push('---');
result.push('');

// Add the original Metadata block (skip the old Section Metadata since we added it per section)
// Find the Metadata line
const metadataIdx = lines.findIndex((l, i) => i > sectionMetaIdx && l.startsWith('| Metadata'));
if (metadataIdx >= 0) {
  for (let i = metadataIdx; i < lines.length; i++) {
    result.push(lines[i]);
  }
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log(`Done! ${states.length} state sections created.`);
console.log(`Total lines: ${result.length}`);
