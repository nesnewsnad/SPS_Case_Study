export interface CsvSection {
  heading: string;
  headers: string[];
  rows: string[][];
}

interface CsvExportOptions {
  title: string;
  filters: string;
  entity: string;
  sections: CsvSection[];
}

function escapeCell(value: string): string {
  // Always quote cells — safe for commas, quotes, newlines
  return `"${value.replace(/"/g, '""')}"`;
}

export function formatCsvContent(options: CsvExportOptions): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# SPS Health — ${options.title} Export`,
    `# Date: ${date}`,
    `# Filters: ${options.filters || 'None'}`,
    `# Entity: ${options.entity}`,
    '',
  ];

  for (let i = 0; i < options.sections.length; i++) {
    if (i > 0) lines.push('');
    const section = options.sections[i];
    lines.push(section.heading);
    lines.push(section.headers.join(','));
    for (const row of section.rows) {
      lines.push(row.map(escapeCell).join(','));
    }
  }

  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
