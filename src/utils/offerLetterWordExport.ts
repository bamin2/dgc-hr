import HTMLtoDOCX from 'html-to-docx';

function getFormattedDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function exportOfferLetterToWord(
  htmlContent: string,
  employeeName: string
): Promise<void> {
  const sanitizedName = employeeName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const filename = `offer-letter-${sanitizedName}-${getFormattedDate()}.docx`;

  // Wrap content in basic HTML structure for better conversion
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; }
          h1 { font-size: 18pt; }
          h2 { font-size: 14pt; }
          p { margin: 8pt 0; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;

  // Convert HTML to DOCX blob
  const docxBlob = await HTMLtoDOCX(fullHtml, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  // Download the file
  const url = URL.createObjectURL(docxBlob as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
