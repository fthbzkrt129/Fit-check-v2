import type {
  ExperimentalBundleInput,
  ExperimentalBundleGarment,
  ExperimentalGarmentSelection,
  ExperimentalImageSource,
} from '../types';

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

export const buildExperimentalBundlePrompt = (
  garmentSelections: ExperimentalGarmentSelection[],
  finalSceneDescription?: string,
) => {
  const orderedSelections = ensureBundleSelections(garmentSelections);
  const garmentInstructions = orderedSelections.map((selection, index) => {
    const imageIndex = index + 2;
    return `Take the element from image ${imageIndex} (${selection.name}) and place it on image 1 with a realistic ${selection.category} fit.`;
  });

  const sceneLine = finalSceneDescription?.trim()
    ? `Final scene direction: ${finalSceneDescription.trim()}.`
    : 'Final scene direction: preserve the existing base-model scene from image 1.';

  return [
    'You are editing one outfit image bundle.',
    'Image 1 is always the base model and scene anchor.',
    ...garmentInstructions,
    sceneLine,
    'Keep the same person identity, body proportions, camera framing, and photorealistic quality.',
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
