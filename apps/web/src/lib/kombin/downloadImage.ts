export const downloadImage = async (imageUrl: string | null, filename: string) => {
  if (!imageUrl) {
    return;
  }

  const link = document.createElement('a');
  let objectUrl: string | null = null;

  if (imageUrl.startsWith('data:image/')) {
    link.href = imageUrl;
  } else {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Image download failed.');
    }

    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }, 0);
};
