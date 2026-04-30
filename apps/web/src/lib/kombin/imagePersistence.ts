export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });

const MINIMUM_FAL_IMAGE_AREA = 589824;
const IMAGE_LOAD_TIMEOUT_MS = 250;

const loadImage = (imageUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const timeoutId = window.setTimeout(() => reject(new Error('Image dimensions could not be read.')), IMAGE_LOAD_TIMEOUT_MS);
    image.onload = () => {
      window.clearTimeout(timeoutId);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('Image could not be loaded.'));
    };
    image.src = imageUrl;
  });

export const ensureMinimumImageAreaDataUrl = async (dataUrl: string): Promise<string> => {
  const image = await loadImage(dataUrl).catch(() => null);

  if (!image) {
    return dataUrl;
  }

  const currentArea = image.width * image.height;

  if (currentArea >= MINIMUM_FAL_IMAGE_AREA) {
    return dataUrl;
  }

  const scale = Math.sqrt(MINIMUM_FAL_IMAGE_AREA / currentArea);
  const width = Math.ceil(image.width * scale);
  const height = Math.ceil(image.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
};

export const imageUrlToDataUrl = async (imageUrl: string): Promise<string> => {
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return blobToDataUrl(blob);
};

export const blobUrlToDataUrl = imageUrlToDataUrl;
