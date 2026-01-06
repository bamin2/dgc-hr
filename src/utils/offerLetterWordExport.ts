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
        <meta charset="UTF-8">
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

  // Dynamically import libraries to avoid breaking the app
  const [{ saveAs }, htmlDocxModule] = await Promise.all([
    import('file-saver'),
    import('html-docx-js/dist/html-docx')
  ]);
  
  const htmlDocx = htmlDocxModule.default;

  // Convert HTML to DOCX blob using browser-compatible library
  const docxBlob = htmlDocx.asBlob(fullHtml);
  
  // Download the file
  saveAs(docxBlob, filename);
}
