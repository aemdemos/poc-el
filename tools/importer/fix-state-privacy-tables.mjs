import fs from 'fs';

const file = '/workspace/content/en-us/about/legal/state-privacy-rights.md';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const result = [];
let fixed = 0;

let i = 0;
while (i < lines.length) {
  const line = lines[i];

  // Check if this is a table row that is NOT a Table header, Section Metadata, or Metadata
  // Pattern: line starts with "| " and contains " | " (table row)
  // AND the line does NOT start with "| Table " or "| Section Metadata" or "| Metadata" or "| Tabs"
  // AND the line is NOT "| --- | --- |" (separator)
  // AND the NEXT line IS "| --- | --- |" (meaning this is a header-less table)
  if (
    line.startsWith('| ') &&
    !line.startsWith('| Table ') &&
    !line.startsWith('| Section Metadata') &&
    !line.startsWith('| Metadata') &&
    !line.startsWith('| Tabs') &&
    !line.startsWith('| ---') &&
    !line.startsWith('| style')
  ) {
    // Look ahead: is this a standalone table without a | Table | | header?
    // Check if previous non-blank line is NOT a table row or separator
    let prevIdx = i - 1;
    while (prevIdx >= 0 && lines[prevIdx].trim() === '') prevIdx--;

    const prevLine = prevIdx >= 0 ? lines[prevIdx] : '';
    const isPartOfExistingTable = prevLine.startsWith('| ---') || prevLine.startsWith('| ');

    if (!isPartOfExistingTable) {
      // This is the start of a table without a | Table | | header
      // Collect all table rows until a non-table line
      const tableRows = [];
      let j = i;
      while (j < lines.length && lines[j].startsWith('| ')) {
        tableRows.push(lines[j]);
        j++;
      }

      // Check if the last row is a separator (| --- | --- |)
      const lastRow = tableRows[tableRows.length - 1];
      const hasSeparatorAtEnd = lastRow && lastRow.match(/^\|\s*---/);

      // Build the fixed table
      result.push('| Table | |');
      result.push('| --- | --- |');

      for (const row of tableRows) {
        if (row.match(/^\|\s*---/)) continue; // skip separator rows
        result.push(row);
      }

      fixed++;
      i = j;
      continue;
    }
  }

  result.push(line);
  i++;
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log(`Fixed ${fixed} tables without | Table | | headers.`);
