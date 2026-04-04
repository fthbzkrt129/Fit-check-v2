import { ApiError, ValidationError, fal, isRetryableError } from '@fal-ai/client';

import { buildExperimentalBundleInput } from '../lib/experimentalBundle';
import type { ExperimentalGarmentSelection, ExperimentalImageSource } from '../types';

const DEFAULT_EXPERIMENTAL_FAL_MODEL = 'fal-ai/wan/v2.7/edit';
const MAX_ATTEMPTS = 2;
const RETRYABLE_STATUS_CODES = [408, 409, 425, 429, 500, 502, 503, 504];

type ExperimentalGenerationRequest = {
  baseModelImage: ExperimentalImageSource;
  garmentSelections: ExperimentalGarmentSelection[];
  finalSceneDescription?: string;
  onStatusUpdate?: (message: string) => void;
};

const getImportMetaEnv = () => {
  try {
    return (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  } catch {
    return undefined;
  }
};

const getEnvValue = (key: string) => {
  const importMetaEnv = getImportMetaEnv();

  return process.env[key] ?? importMetaEnv?.[key] ?? importMetaEnv?.[`VITE_${key}`];
};

const configureFalClient = () => {
  const falKey = getEnvValue('FAL_KEY');

  if (!falKey) {
    throw new Error('fal.ai deneysel akışı yapılandırılmadı. Lütfen FAL_KEY ayarını ekleyin.');
  }

  // Security caveat: this browser-only SPA currently passes fal credentials to the client,
  // matching the existing Gemini env exposure pattern until a server-side proxy is introduced.
  fal.config({ credentials: falKey });
};

const uploadImageSource = async (source: ExperimentalImageSource) => {
  if (typeof source === 'string') {
    return source;
  }

  return fal.storage.upload(source);
};

const getStatusMessage = (status?: string) => {
  switch (status) {
    case 'IN_QUEUE':
      return 'Kombin siraya alindi...';
    case 'IN_PROGRESS':
      return 'Kombin olusturuluyor...';
    case 'COMPLETED':
      return 'Son goruntu hazirlaniyor...';
    default:
      return 'Kombin isleniyor...';
  }
};

const normalizeFalResult = (result: any): string => {
  const firstImage = result?.data?.images?.[0];

  if (typeof firstImage === 'string') {
    return firstImage;
  }

  if (typeof firstImage?.url === 'string') {
    return firstImage.url;
  }

  if (typeof result?.data?.image === 'string') {
    return result.data.image;
  }

  if (typeof result?.data?.image?.url === 'string') {
    return result.data.image.url;
  }

  throw new Error('fal.ai sonucu görsel döndürmedi.');
};

const normalizeFalError = (error: unknown): Error => {
  if (error instanceof ValidationError) {
    return new Error('Deneysel kombin isteği doğrulanamadı. Lütfen seçimleri ve açıklamayı kontrol edin.');
  }

  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return new Error('fal.ai kimlik doğrulaması başarısız. FAL_KEY ayarını kontrol edin.');
    }

    const apiDetail = typeof error.body === 'string'
      ? error.body
      : JSON.stringify(error.body ?? {}).slice(0, 300);

    return new Error(`fal.ai deneysel kombin isteği şu anda tamamlanamadı. ${apiDetail || 'Lutfen tekrar deneyin.'}`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Deneysel kombin üretimi beklenmeyen bir nedenle başarısız oldu.');
};

const buildFalRequestInput = async (request: ExperimentalGenerationRequest) => {
  const bundle = buildExperimentalBundleInput(
    request.baseModelImage,
    request.garmentSelections,
    request.finalSceneDescription,
  );

  const uploadedImages = await Promise.all(bundle.imageInputs.map(uploadImageSource));
  const rawInput = {
    prompt: bundle.prompt,
    image_urls: uploadedImages,
    num_images: 1,
    output_format: 'png',
    enable_prompt_expansion: false,
  };

  return await fal.storage.transformInput(rawInput);
};

const executeFalRequest = async (request: ExperimentalGenerationRequest) => {
  const endpoint = getExperimentalFalModel();
  const input = await buildFalRequestInput(request);
  const submitted = await fal.queue.submit(endpoint, { input });

  request.onStatusUpdate?.('Kombin olusturma baslatildi...');

  await fal.queue.subscribeToStatus(endpoint, {
    requestId: submitted.request_id,
    onQueueUpdate: (update) => request.onStatusUpdate?.(getStatusMessage(update?.status)),
  });

  const result = await fal.queue.result(endpoint, { requestId: submitted.request_id });
  return normalizeFalResult(result);
};

export const getExperimentalFalModel = () => {
  const configuredModel = getEnvValue('VITE_FAL_EXPERIMENTAL_MODEL');
  return configuredModel?.trim() || DEFAULT_EXPERIMENTAL_FAL_MODEL;
};

export const generateExperimentalOutfitImage = async (
  request: ExperimentalGenerationRequest,
): Promise<string> => {
  configureFalClient();

  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    try {
      return await executeFalRequest(request);
    } catch (error) {
      const canRetry = attempt === 0 && isRetryableError(error, RETRYABLE_STATUS_CODES);

      if (canRetry) {
        attempt += 1;
        request.onStatusUpdate?.('Geçici fal.ai hatası nedeniyle istek bir kez yeniden deneniyor...');
        continue;
      }

      throw normalizeFalError(error);
    }
  }

  throw new Error('fal.ai deneysel kombin isteği şu anda tamamlanamadı. Lütfen tekrar deneyin.');
};
