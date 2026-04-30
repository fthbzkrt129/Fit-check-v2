import type {
  ExperimentalBundleInput,
  ExperimentalBundleGarment,
  ExperimentalGarmentSelection,
  ExperimentalImageSource,
} from '@/lib/kombin/types';

const getUniqueGarments = (garmentSelections: ExperimentalGarmentSelection[]) => {
  const seen = new Set<string>();

  return garmentSelections.filter((selection) => {
    if (seen.has(selection.id)) {
      return false;
    }

    seen.add(selection.id);
    return true;
  });
};

const ensureBundleSelections = (garmentSelections: ExperimentalGarmentSelection[]) => {
  if (garmentSelections.length === 0) {
    throw new Error('At least one garment selection is required.');
  }

  return getUniqueGarments(garmentSelections);
};

const getCategoryActionInstruction = (category: ExperimentalGarmentSelection['category']) => {
  switch (category) {
    case 'top':
      return 'replace only the upper-body garment while preserving bottoms, footwear, accessories, pose, body, face, and scene';
    case 'bottom':
      return 'replace only the lower-body garment while preserving tops, outerwear, footwear, accessories, pose, body, face, and scene';
    case 'dress':
      return 'replace the visible top and bottom outfit area with the dress while preserving footwear, accessories, pose, body, face, and scene';
    case 'outerwear':
      return 'layer it naturally over the existing visible top while preserving the rest of the outfit, pose, body, face, and scene';
    case 'footwear':
      return 'replace only the footwear while preserving the rest of the visible outfit, pose, body, face, and scene';
    case 'accessory':
      return 'add only the accessory while preserving the rest of the visible outfit, pose, body, face, and scene';
    default:
      return 'apply it naturally while preserving non-conflicting visible outfit pieces, pose, body, face, and scene';
  }
};

export const buildExperimentalBundlePrompt = (
  garmentSelections: ExperimentalGarmentSelection[],
  finalSceneDescription?: string,
) => {
  const orderedSelections = ensureBundleSelections(garmentSelections);
  const garmentInstructions = orderedSelections.map((selection, index) => {
    const imageIndex = index + 2;
    return `Use image ${imageIndex} (${selection.name}) as the exact ${selection.category} garment reference and ${getCategoryActionInstruction(selection.category)}.`;
  });
  const detailInstructions = orderedSelections
    .map((selection, index) => {
      const detailInstruction = selection.detailInstruction?.trim();

      if (!detailInstruction) {
        return null;
      }

      return `Additional detail for image ${index + 2} (${selection.name}): ${detailInstruction}.`;
    })
    .filter((instruction): instruction is string => Boolean(instruction));

  const sceneLine = finalSceneDescription?.trim()
    ? `Scene direction: ${finalSceneDescription.trim()}.`
    : 'Scene direction: preserve the original background and composition from image 1.';

  return [
    'Create one realistic try-on result using the provided image set.',
    'Image 1 is the current visible outfit/result image and must remain the identity, pose, body proportions, camera framing, and scene anchor.',
    ...garmentInstructions,
    ...detailInstructions,
    sceneLine,
    'If a garment reference matches a category already visible in image 1, replace that category instead of layering duplicates.',
    'If a garment reference introduces a new non-conflicting category, preserve the existing visible outfit pieces.',
    'Preserve the garment color, fabric appearance, silhouette, proportions, pattern, and visible design details from each garment reference as closely as possible.',
    'Do not duplicate garments, invent logos or patterns, change the model face, alter body proportions, add extra limbs, or remove unrelated garments.',
    'Keep the result photorealistic, clean, and believable as a real try-on image.',
    'Return one final image only.',
  ].join(' ');
};

export const buildExperimentalBundleInput = (
  baseModelImage: ExperimentalImageSource,
  garmentSelections: ExperimentalGarmentSelection[],
  finalSceneDescription?: string,
): ExperimentalBundleInput => {
  const orderedSelections = ensureBundleSelections(garmentSelections);
  const garments: ExperimentalBundleGarment[] = orderedSelections.map((selection, index) => ({
    ...selection,
    imageIndex: index + 2,
  }));

  return {
    baseModelImage,
    imageInputs: [baseModelImage, ...garments.map((garment) => garment.source)],
    garments,
    finalSceneDescription: finalSceneDescription?.trim() || undefined,
    prompt: buildExperimentalBundlePrompt(orderedSelections, finalSceneDescription),
  };
};
