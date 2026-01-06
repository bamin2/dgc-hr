import { saveAs } from 'file-saver';

function getFormattedDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Load vendor script once and cache the promise
let scriptLoadPromise: Promise<void> | null = null;

function loadHtmlDocxScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).htmlDocx) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = '/vendor/html-docx.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Word export library'));
    document.head.appendChild(script);
  });
  
  return scriptLoadPromise;
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

  // Load the vendor script at runtime (avoids Vite parsing issues)
  await loadHtmlDocxScript();
  
  const htmlDocx = (window as any).htmlDocx;
  if (!htmlDocx) {
    throw new Error('Word export library not available');
  }

  // Convert HTML to DOCX blob
  const docxBlob = htmlDocx.asBlob(fullHtml);
  
  // Download the file
  saveAs(docxBlob, filename);
}
