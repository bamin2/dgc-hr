import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const getFormattedDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const downloadFile = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export async function exportToPng(element: HTMLElement): Promise<void> {
  const filename = `org-chart-${getFormattedDate()}.png`;
  
  const dataUrl = await toPng(element, {
    quality: 1,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    cacheBust: true,
  });
  
  downloadFile(dataUrl, filename);
}

export async function exportToSvg(element: HTMLElement): Promise<void> {
  const filename = `org-chart-${getFormattedDate()}.svg`;
  
  const dataUrl = await toSvg(element, {
    backgroundColor: '#ffffff',
    cacheBust: true,
  });
  
  downloadFile(dataUrl, filename);
}

export async function exportToPdf(element: HTMLElement): Promise<void> {
  const filename = `org-chart-${getFormattedDate()}.pdf`;
  
  const dataUrl = await toPng(element, {
    quality: 1,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    cacheBust: true,
  });

  const img = new Image();
  img.src = dataUrl;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const imgWidth = img.width;
  const imgHeight = img.height;
  
  // Use landscape for wide charts, portrait for tall ones
  const orientation = imgWidth > imgHeight ? 'l' : 'p';
  const pdf = new jsPDF(orientation, 'mm', 'a4');
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate dimensions to fit the page with margins
  const margin = 10;
  const availableWidth = pageWidth - (margin * 2);
  const availableHeight = pageHeight - (margin * 2);
  
  const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
  const width = imgWidth * ratio;
  const height = imgHeight * ratio;
  
  // Center the image
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;
  
  pdf.addImage(dataUrl, 'PNG', x, y, width, height);
  pdf.save(filename);
}
