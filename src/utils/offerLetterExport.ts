import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

function getFormattedDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function exportOfferLetterToPdf(
  element: HTMLElement,
  employeeName: string
): Promise<void> {
  const sanitizedName = employeeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const filename = `offer-letter-${sanitizedName}-${getFormattedDate()}.pdf`;

  // Convert HTML to image with high quality
  const dataUrl = await toPng(element, {
    quality: 1,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    cacheBust: true,
  });

  // Create PDF in A4 portrait format
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add margins
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);

  // Load image to get dimensions
  const img = new Image();
  img.src = dataUrl;
  
  await new Promise<void>((resolve) => {
    img.onload = () => {
      const imgAspectRatio = img.width / img.height;
      const pageAspectRatio = contentWidth / contentHeight;

      let finalWidth: number;
      let finalHeight: number;

      if (imgAspectRatio > pageAspectRatio) {
        // Image is wider than page
        finalWidth = contentWidth;
        finalHeight = contentWidth / imgAspectRatio;
      } else {
        // Image is taller than page - fit to width and handle multi-page if needed
        finalWidth = contentWidth;
        finalHeight = contentWidth / imgAspectRatio;
      }

      // If content fits on one page
      if (finalHeight <= contentHeight) {
        pdf.addImage(dataUrl, 'PNG', margin, margin, finalWidth, finalHeight);
      } else {
        // Multi-page handling for long documents
        let remainingHeight = finalHeight;
        let yOffset = 0;
        
        while (remainingHeight > 0) {
          if (yOffset > 0) {
            pdf.addPage();
          }
          
          // Calculate the portion of the image to render on this page
          const heightOnThisPage = Math.min(contentHeight, remainingHeight);
          const sourceY = (yOffset / finalHeight) * img.height;
          const sourceHeight = (heightOnThisPage / finalHeight) * img.height;
          
          // Create a canvas for this page's portion
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = sourceHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
              img,
              0, sourceY, img.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            
            pdf.addImage(
              canvas.toDataURL('image/png'),
              'PNG',
              margin,
              margin,
              finalWidth,
              heightOnThisPage
            );
          }
          
          yOffset += heightOnThisPage;
          remainingHeight -= contentHeight;
        }
      }
      
      resolve();
    };
  });

  pdf.save(filename);
}
