export const downloadImage = async (imageUrl: string | null, filename: string) => {
  if (!imageUrl) {
    return;
  }

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }, 0);
};
