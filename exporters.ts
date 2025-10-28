export function exportCSV(rows: any[], filename = 'export.csv') {
  if (!rows || rows.length === 0) {
    return;
  }
  const keys = Object.keys(rows[0] || {});
  const header = keys.join(',');
  const csvRows = rows.map(row => 
    keys.map(key => JSON.stringify(row[key] ?? '')).join(',')
  );
  
  const csv = [header, ...csvRows].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToGoogleSheets(rows: any[]) {
  alert('Google Sheets export stub — connect your OAuth flow on backend.');
}