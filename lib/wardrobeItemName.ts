export const formatWardrobeItemName = (fileName: string): string => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  const normalized = withoutExtension
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return 'Uploaded Item';
  }

  if (normalized.length <= 24) {
    return normalized;
  }

  return `${normalized.slice(0, 21).trimEnd()}...`;
};
