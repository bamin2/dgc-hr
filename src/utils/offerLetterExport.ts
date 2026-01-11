import { supabase } from '@/integrations/supabase/client';

// DocxTemplateData uses smart tag names (with spaces) as keys
// e.g., "First Name", "Company Name", etc.
export type DocxTemplateData = Record<string, string | number | undefined | null>;

function getFormattedDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Dynamic imports of html-to-image and jsPDF for reduced initial bundle
export async function exportOfferLetterToPdf(
  element: HTMLElement,
  employeeName: string
): Promise<void> {
  const [{ toPng }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);

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

// Dynamic imports of pizzip, docxtemplater, and file-saver for reduced initial bundle
export async function exportOfferLetterToDocx(
  docxTemplateUrl: string,
  data: DocxTemplateData,
  employeeName: string
): Promise<void> {
  const [{ default: PizZip }, { default: Docxtemplater }, { saveAs }] = await Promise.all([
    import('pizzip'),
    import('docxtemplater'),
    import('file-saver'),
  ]);

  const sanitizedName = employeeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const filename = `offer-letter-${sanitizedName}-${getFormattedDate()}.docx`;

  // Extract file path from full URL if it's a complete URL
  // Full URL format: https://xxx.supabase.co/storage/v1/object/public/docx-templates/filename.docx
  let filePath = docxTemplateUrl;
  if (docxTemplateUrl.includes('/docx-templates/')) {
    filePath = decodeURIComponent(docxTemplateUrl.split('/docx-templates/').pop() || docxTemplateUrl);
  }

  // Download the template from Supabase Storage
  const { data: fileData, error } = await supabase.storage
    .from('docx-templates')
    .download(filePath);

  if (error || !fileData) {
    throw new Error(`Failed to download template: ${error?.message || 'Unknown error'}`);
  }

  // Convert blob to ArrayBuffer
  const arrayBuffer = await fileData.arrayBuffer();
  
  // Load the template with PizZip
  const zip = new PizZip(arrayBuffer);
  
  // Create docxtemplater instance with custom delimiters for <<tag>> syntax
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: {
      start: '<<',
      end: '>>',
    },
  });

  // Render the document with data
  doc.render(data);

  // Generate the output document
  const outputBlob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  // Trigger download
  saveAs(outputBlob, filename);
}
