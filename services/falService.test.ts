import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockConfig,
  mockUpload,
  mockTransformInput,
  mockSubmit,
  mockSubscribeToStatus,
  mockResult,
  mockIsRetryableError,
  MockApiError,
  MockValidationError,
} = vi.hoisted(() => ({
  mockConfig: vi.fn(),
  mockUpload: vi.fn(),
  mockTransformInput: vi.fn(),
  mockSubmit: vi.fn(),
  mockSubscribeToStatus: vi.fn(),
  mockResult: vi.fn(),
  mockIsRetryableError: vi.fn(),
  MockApiError: class MockApiError extends Error {
    status?: number;
    requestId?: string;
    body?: unknown;

    constructor(message: string, init: Partial<MockApiError> = {}) {
      super(message);
      this.name = 'ApiError';
      Object.assign(this, init);
    }
  },
  MockValidationError: class MockValidationError extends Error {
    details: Array<{ loc: string[]; msg: string }>;

    constructor(message: string, details: Array<{ loc: string[]; msg: string }> = []) {
      super(message);
      this.name = 'ValidationError';
      this.details = details;
    }
  },
}));

vi.mock('@fal-ai/client', () => ({
  fal: {
    config: mockConfig,
    storage: {
      upload: mockUpload,
      transformInput: mockTransformInput,
    },
    queue: {
      submit: mockSubmit,
      subscribeToStatus: mockSubscribeToStatus,
      result: mockResult,
    },
  },
  ApiError: MockApiError,
  ValidationError: MockValidationError,
  isRetryableError: mockIsRetryableError,
}));

import { generateExperimentalOutfitImage, getExperimentalFalModel } from './falService';

const request = {
  baseModelImage: 'https://example.com/model.png',
  garmentSelections: [
    {
      id: 'top-1',
      name: 'Cream Blazer',
      category: 'top' as const,
      source: new File(['top'], 'top.png', { type: 'image/png' }),
    },
    {
      id: 'shoe-1',
      name: 'Brown Boots',
      category: 'footwear' as const,
      source: new Blob(['shoe'], { type: 'image/png' }),
    },
  ],
  finalSceneDescription: 'editorial rooftop at sunset',
};

describe('falService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VITE_FAL_EXPERIMENTAL_MODEL;
    process.env.FAL_KEY = 'fal-test-key';

    mockUpload.mockImplementation(async (file: File | Blob) => {
      if (file instanceof File) {
        return `https://files.example.com/${file.name}`;
      }

      return 'https://files.example.com/blob-upload.png';
    });
    mockTransformInput.mockImplementation(async (input) => input);
    mockSubmit.mockResolvedValue({ request_id: 'req_123' });
    mockSubscribeToStatus.mockImplementation(async (_endpoint, options) => {
      options.onQueueUpdate?.({ status: 'IN_PROGRESS' });
      return { status: 'COMPLETED' };
    });
    mockResult.mockResolvedValue({
      data: {
        images: [{ url: 'https://fal.ai/generated.png' }],
      },
    });
    mockIsRetryableError.mockReturnValue(false);
  });

  it('resolves the fal model from env with a wan default', () => {
    expect(getExperimentalFalModel()).toBe('wan/v2.6/image-to-image');

    process.env.VITE_FAL_EXPERIMENTAL_MODEL = 'fal-ai/custom-model';

    expect(getExperimentalFalModel()).toBe('fal-ai/custom-model');
  });

  it('uploads file inputs and submits a single queued bundle request', async () => {
    const statusUpdates: string[] = [];
    const imageUrl = await generateExperimentalOutfitImage({
      ...request,
      onStatusUpdate: (status) => statusUpdates.push(status),
    });

    expect(imageUrl).toBe('https://fal.ai/generated.png');
    expect(mockConfig).toHaveBeenCalledWith({ credentials: 'fal-test-key' });
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(mockTransformInput).toHaveBeenCalledWith({
      prompt: expect.stringContaining('Take the element from image 2'),
      image_urls: [
        'https://example.com/model.png',
        'https://files.example.com/top.png',
        'https://files.example.com/blob-upload.png',
      ],
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith('wan/v2.6/image-to-image', {
      input: {
        prompt: expect.stringContaining('editorial rooftop at sunset'),
        image_urls: [
          'https://example.com/model.png',
          'https://files.example.com/top.png',
          'https://files.example.com/blob-upload.png',
        ],
      },
    });
    expect(statusUpdates).toContain('fal.ai request is in progress...');
  });

  it('retries retryable fal errors once before succeeding', async () => {
    const retryableError = new MockApiError('Temporary issue', { status: 503 });

    mockSubmit
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValueOnce({ request_id: 'req_456' });
    mockIsRetryableError.mockImplementation((error) => error === retryableError);

    const imageUrl = await generateExperimentalOutfitImage(request);

    expect(imageUrl).toBe('https://fal.ai/generated.png');
    expect(mockSubmit).toHaveBeenCalledTimes(2);
  });

  it('fails fast for validation and non-retryable fal errors with friendly messages', async () => {
    mockSubmit.mockRejectedValueOnce(
      new MockValidationError('Validation failed', [{ loc: ['prompt'], msg: 'required' }]),
    );

    await expect(generateExperimentalOutfitImage(request)).rejects.toThrow(
      'Deneysel kombin isteği doğrulanamadı. Lütfen seçimleri ve açıklamayı kontrol edin.',
    );
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    process.env.FAL_KEY = 'fal-test-key';
    mockUpload.mockImplementation(async (file: File | Blob) =>
      file instanceof File ? `https://files.example.com/${file.name}` : 'https://files.example.com/blob-upload.png',
    );
    mockTransformInput.mockImplementation(async (input) => input);
    mockSubmit.mockRejectedValueOnce(new MockApiError('Server exploded', { status: 500 }));
    mockIsRetryableError.mockReturnValue(false);

    await expect(generateExperimentalOutfitImage(request)).rejects.toThrow(
      'fal.ai deneysel kombin isteği şu anda tamamlanamadı. Lütfen tekrar deneyin.',
    );
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
