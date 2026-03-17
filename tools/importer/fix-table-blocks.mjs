import fs from 'fs';

const file = '/workspace/content/en-us/about/legal/state-privacy-rights.md';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Known EDS block tables that should NOT be wrapped with Table block
const skipHeaders = ['Tabs Legal', 'Section Metadata', 'Metadata'];

const result = [];
let i = 0;
let tablesFixed = 0;

while (i < lines.length) {
  const line = lines[i];

  // Check if this line is a table separator (| --- | --- | ...)
  const isSeparator = /^\|\s*-+\s*(\|\s*-+\s*)*\|?\s*$/.test(line);

  if (isSeparator && i > 0) {
    // Previous line should be the header row
    const headerLine = lines[i - 1];

    if (headerLine.startsWith('|')) {
      // Extract the first cell content to check if it's an EDS block
      const firstCell = headerLine.split('|')[1]?.trim() || '';
      const isEdsBlock = skipHeaders.some(h => firstCell === h || firstCell === `**${h}**`);

      if (!isEdsBlock) {
        // Count columns from separator
        const colCount = (line.match(/---/g) || []).length;
        const tableCells = Array(colCount).fill('').join(' | ');
        const separatorCells = Array(colCount).fill('---').join(' | ');

        // Remove the header line we already added to result (it was the previous line)
        const headerLineFromResult = result.pop();

        // Add Table block header + separator + original header as data row
        result.push(`| Table | ${tableCells.substring(tableCells.indexOf('|') + 1 || 0)}`.replace(/\| $/, '|').replace(/\|\s*$/, '|'));

        // Simpler: just build the right number of columns
        const tableRow = '| Table |' + ' |'.repeat(colCount - 1);
        const sepRow = '| --- |' + ' --- |'.repeat(colCount - 1);

        // Replace last two lines with new ones
        result[result.length - 1] = tableRow;
        result.push(sepRow);
        result.push(headerLineFromResult); // Original header becomes data row

        tablesFixed++;
        i++; // Skip the old separator line
        continue;
      }
    }
  }

  result.push(line);
  i++;
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log(`Fixed ${tablesFixed} tables in state-privacy-rights.md`);
