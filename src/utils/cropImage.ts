export interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels,
  maxDimension?: number,
  preserveTransparency?: boolean
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate output dimensions with optional resizing
  let outputWidth = croppedAreaPixels.width;
  let outputHeight = croppedAreaPixels.height;

  if (maxDimension && (outputWidth > maxDimension || outputHeight > maxDimension)) {
    const scale = maxDimension / Math.max(outputWidth, outputHeight);
    outputWidth = Math.round(outputWidth * scale);
    outputHeight = Math.round(outputHeight * scale);
  }

  // Set canvas size to the output dimensions
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped portion scaled to output dimensions
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Detect if image is PNG (has transparency)
  const isPng = preserveTransparency || imageSrc.startsWith('data:image/png');

  // Return as Blob - preserve PNG format for transparent images
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas is empty'))),
      isPng ? 'image/png' : 'image/jpeg',
      isPng ? undefined : 0.9
    );
  });
}

export async function resizeImage(
  imageSrc: string,
  maxDimension: number,
  preserveTransparency?: boolean
): Promise<{ blob: Blob; isPng: boolean }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate output dimensions maintaining aspect ratio
  let outputWidth = image.width;
  let outputHeight = image.height;

  if (outputWidth > maxDimension || outputHeight > maxDimension) {
    const scale = maxDimension / Math.max(outputWidth, outputHeight);
    outputWidth = Math.round(outputWidth * scale);
    outputHeight = Math.round(outputHeight * scale);
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the full image scaled to output dimensions
  ctx.drawImage(image, 0, 0, outputWidth, outputHeight);

  // Detect if image is PNG (has transparency)
  const isPng = preserveTransparency || imageSrc.startsWith('data:image/png');

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve({ blob, isPng }) : reject(new Error('Canvas is empty'))),
      isPng ? 'image/png' : 'image/jpeg',
      isPng ? undefined : 0.9
    );
  });
}
