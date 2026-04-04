export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });

export const imageUrlToDataUrl = async (imageUrl: string): Promise<string> => {
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return blobToDataUrl(blob);
};

export const blobUrlToDataUrl = imageUrlToDataUrl;
