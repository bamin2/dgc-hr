import { Employee } from '@/hooks/useEmployees';

export function exportEmployeesToCSV(employees: Employee[], filename: string) {
  const headers = [
    'Employee ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'Department', 'Position', 'Status', 'Join Date', 'Manager', 'Location'
  ];
  
  const rows = employees.map(emp => [
    emp.employeeId,
    emp.firstName,
    emp.lastName,
    emp.email,
    emp.phone || '',
    emp.department,
    emp.position,
    emp.status,
    emp.joinDate,
    emp.manager || '',
    emp.location || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportEmployeesToJSON(employees: Employee[], filename: string) {
  const jsonContent = JSON.stringify(employees, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

// Dynamic import of jsPDF for reduced initial bundle
export async function exportEmployeesToPDF(employees: Employee[], filename: string) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Employee Directory', 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Total Employees: ${employees.length}`, 14, 34);
  
  // Table headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const headers = ['Name', 'Email', 'Department', 'Position', 'Status'];
  let y = 45;
  
  // Draw header background
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 4, 182, 7, 'F');
  
  // Draw headers
  headers.forEach((header, i) => {
    doc.text(header, 16 + (i * 36), y);
  });
  
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  // Draw employee rows
  employees.forEach((emp, index) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y - 4, 182, 6, 'F');
    }
    
    const row = [
      `${emp.firstName} ${emp.lastName}`.slice(0, 18),
      emp.email.slice(0, 22),
      emp.department.slice(0, 14),
      emp.position.slice(0, 14),
      emp.status
    ];
    
    row.forEach((cell, i) => {
      doc.text(cell, 16 + (i * 36), y);
    });
    
    y += 6;
  });

  doc.save(`${filename}.pdf`);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
