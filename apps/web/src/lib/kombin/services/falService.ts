import { buildExperimentalBundleInput } from '@/lib/kombin/experimentalBundle';
import { imageUrlToDataUrl, blobToDataUrl } from '@/lib/kombin/imagePersistence';
import { aiSuccessSchema } from '@/lib/ai/contracts';
import type { ExperimentalGarmentSelection, ExperimentalImageSource } from '@/lib/kombin/types';

type ExperimentalGenerationRequest = {
  baseModelImage: ExperimentalImageSource;
  garmentSelections: ExperimentalGarmentSelection[];
  finalSceneDescription?: string;
  onStatusUpdate?: (message: string) => void;
};

const normalizeImageSource = async (source: ExperimentalImageSource) => {
  if (typeof source === 'string') {
    return imageUrlToDataUrl(source);
  }

  return blobToDataUrl(source);
};

const resolveWorkspaceSlug = (locationLike: Pick<Location, 'pathname' | 'hostname'> | null | undefined): string => {
  const pathname = locationLike?.pathname ?? '';
  const workspaceMatch = pathname.match(/^\/workspace\/([^/]+)/);
  if (workspaceMatch?.[1]) {
    return decodeURIComponent(workspaceMatch[1]);
  }

  const devMatch = pathname.match(/^\/dev\/([^/]+)/);
  if (devMatch?.[1]) {
    return decodeURIComponent(devMatch[1]);
  }

  const hostname = locationLike?.hostname ?? '';
  const hostParts = hostname.split('.').filter(Boolean);
  if (hostParts.length >= 3 && hostParts[0]) {
    return hostParts[0];
  }

  throw new Error('Workspace slug could not be resolved for secure experimental request.');
};

const buildExperimentalRequestPayload = async (
  request: ExperimentalGenerationRequest,
  normalizeSource: (source: ExperimentalImageSource) => Promise<string> = normalizeImageSource,
) => {
  const bundle = buildExperimentalBundleInput(
    request.baseModelImage,
    request.garmentSelections,
    request.finalSceneDescription,
  );

  const imageInputs = await Promise.all(bundle.imageInputs.map((source) => normalizeSource(source)));
  const workspaceSlug = resolveWorkspaceSlug(typeof window === 'undefined' ? null : window.location);

  return {
    workspaceSlug,
    baseModelImage: imageInputs[0],
    imageInputs,
    garments: bundle.garments.map(({ id, name, category, imageIndex }) => ({
      id,
      name,
      category,
      imageIndex,
    })),
    finalSceneDescription: bundle.finalSceneDescription,
    prompt: bundle.prompt,
  };
};

const requestExperimentalImage = async (
  request: ExperimentalGenerationRequest,
  fetchImpl: typeof fetch = fetch,
  normalizeSource: (source: ExperimentalImageSource) => Promise<string> = normalizeImageSource,
) => {
  const payload = await buildExperimentalRequestPayload(request, normalizeSource);
  const response = await fetchImpl('/api/ai/experimental', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = (await response.text()).trim();
    throw Object.assign(new Error(message || 'Deneysel kombin üretilemedi.'), {
      status: response.status,
    });
  }

  const body = aiSuccessSchema.parse(await response.json());
  return body.imageUrl;
};

export const generateExperimentalOutfitImage = async (
  request: ExperimentalGenerationRequest,
  fetchImpl: typeof fetch = fetch,
  normalizeSource: (source: ExperimentalImageSource) => Promise<string> = normalizeImageSource,
): Promise<string> => {
  return requestExperimentalImage(request, fetchImpl, normalizeSource);
};

export const __private__ = {
  buildExperimentalRequestPayload,
  normalizeImageSource,
  requestExperimentalImage,
  resolveWorkspaceSlug,
};
