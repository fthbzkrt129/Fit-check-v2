/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function getImageDimensions(url: string): Promise<{width: number, height: number}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({width: img.width, height: img.height});
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function scaleImageProportionally(
  imageUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  const {width, height} = await getImageDimensions(imageUrl);

  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  if (newWidth === width && newHeight === height) {
    const img = new Image();
    img.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context');
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    return canvas.toDataURL();
  }

  const img = new Image();
  img.src = imageUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  return canvas.toDataURL();
}

export async function ensureDimensions(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  const {width, height} = await getImageDimensions(imageUrl);

  if (width === targetWidth && height === targetHeight) {
    const img = new Image();
    img.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context');
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL();
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const img = new Image();
  img.src = imageUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });

  let drawX = 0;
  let drawY = 0;
  let drawWidth = width;
  let drawHeight = height;

  const widthRatio = width / targetWidth;
  const heightRatio = height / targetHeight;

  if (widthRatio > heightRatio) {
    drawHeight = targetHeight;
    drawWidth = Math.round(targetHeight * heightRatio);
    drawX = Math.round((width - drawWidth) / 2);
  } else {
    drawWidth = targetWidth;
    drawHeight = Math.round(targetWidth * widthRatio);
    drawY = Math.round((height - drawHeight) / 2);
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL();
}
