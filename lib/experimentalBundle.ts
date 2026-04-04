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
    return `Use image ${imageIndex} (${selection.name}) as the exact ${selection.category} garment reference and apply it naturally to the person in image 1.`;
  });

  const sceneLine = finalSceneDescription?.trim()
    ? `Scene direction: ${finalSceneDescription.trim()}.`
    : 'Scene direction: preserve the original background and composition from image 1.';

  return [
    'Create one realistic try-on result using the provided image set.',
    'Image 1 is the base model photo and must remain the identity, pose, body proportions, camera framing, and scene anchor.',
    ...garmentInstructions,
    sceneLine,
    'Preserve the garment color, fabric appearance, silhouette, proportions, pattern, and visible design details from each garment reference as closely as possible.',
    'Remove or replace any conflicting clothing already visible on the model so the final result shows one coherent outfit.',
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
