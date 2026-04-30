import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateExperimentalOutfitImage, generateGptSceneVariation } from './falServer';

describe('falServer', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    vi.stubEnv('GEMINI_API_KEY', 'gemini-key');
    vi.stubEnv('FAL_KEY', 'fal-key');
  });

  it('follows fal queue responses until the generated image result is available', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          request_id: 'request-1',
          status_url: 'https://queue.fal.run/status/request-1',
          response_url: 'https://queue.fal.run/result/request-1',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'COMPLETED' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ url: 'https://example.com/generated.png' }],
          seed: 123,
        }),
      });

    await expect(
      generateExperimentalOutfitImage(
        {
          prompt: 'Use image 2 as the top.',
          imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,top'],
        },
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBe('https://example.com/generated.png');

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://queue.fal.run/fal-ai/wan/v2.7/edit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Use image 2 as the top.',
          image_urls: ['data:image/png;base64,model', 'data:image/png;base64,top'],
          num_images: 1,
        }),
      }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://queue.fal.run/status/request-1',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      'https://queue.fal.run/result/request-1',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('submits GPT Image 2 edit requests with low quality at 768 square size', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          request_id: 'request-gpt',
          status_url: 'https://queue.fal.run/status/request-gpt',
          response_url: 'https://queue.fal.run/result/request-gpt',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'COMPLETED' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [{ url: 'https://example.com/gpt-generated.png' }] }),
      });

    await expect(
      generateExperimentalOutfitImage(
        {
          provider: 'gpt-image-2',
          prompt: 'Use image 2 as the bottom.',
          imageInputs: ['data:image/png;base64,model', 'data:image/png;base64,bottom'],
        },
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBe('https://example.com/gpt-generated.png');

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://queue.fal.run/openai/gpt-image-2/edit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Use image 2 as the bottom.',
          image_urls: ['data:image/png;base64,model', 'data:image/png;base64,bottom'],
          image_size: { width: 768, height: 768 },
          quality: 'low',
          num_images: 1,
          output_format: 'png',
        }),
      }),
    );
  });

  it('submits GPT Image 2 scene edits with an editorial photography prompt and one base image', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [{ url: 'https://example.com/gpt-scene.png' }] }),
      });

    await expect(
      generateGptSceneVariation(
        'data:image/png;base64,look',
        'street',
        'golden hour',
        'pro',
        'rooftop terrace',
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBe('https://example.com/gpt-scene.png');

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://queue.fal.run/openai/gpt-image-2/edit',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('rooftop terrace'),
      }),
    );
    const requestBody = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(requestBody).toMatchObject({
      image_urls: ['data:image/png;base64,look'],
      image_size: { width: 1024, height: 1024 },
      quality: 'high',
      num_images: 1,
      output_format: 'png',
    });
    expect(requestBody.prompt).toContain('world-class fashion editorial photographer');
    expect(requestBody.prompt).toContain('This is NOT a virtual try-on task.');
    expect(requestBody.prompt).toContain('Do not replace, redesign, or reinterpret any clothing.');
    expect(requestBody.prompt).toContain('make tasteful natural stance adjustments');
    expect(requestBody.prompt).toContain('foot placement, weight distribution, shoulder angle, hand relaxation, and head direction');
    expect(requestBody.prompt).toContain('model must physically belong to the location');
    expect(requestBody.prompt).toContain('Relight the subject to match the environment');
    expect(requestBody.prompt).toContain('same light direction, shadow softness, color temperature, contrast, and ambient bounce');
    expect(requestBody.prompt).toContain('realistic contact shadows under both feet');
    expect(requestBody.prompt).toContain('must look captured in-camera, not composited');
    expect(requestBody.prompt).toContain('Scene direction: a rooftop terrace environment.');
    expect(requestBody.prompt).toContain('Lighting direction: warm golden hour lighting');
    expect(requestBody.prompt).toContain('Mario Testino-style luxury editorial lighting and composition');
    expect(requestBody.prompt).not.toContain('You will receive an existing fashion try-on image.');
  });

  it('allows high quality GPT Image 2 scene queues to run longer than standard edits', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        request_id: 'request-pro-scene',
        status_url: 'https://queue.fal.run/status/request-pro-scene',
        response_url: 'https://queue.fal.run/result/request-pro-scene',
      }),
    });

    for (let index = 0; index < 75; index += 1) {
      fetchImpl.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'IN_PROGRESS' }),
      });
    }

    fetchImpl
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'COMPLETED' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [{ url: 'https://example.com/slow-pro-scene.png' }] }),
      });

    const result = generateGptSceneVariation(
      'data:image/png;base64,look',
      'street',
      'golden hour',
      'pro',
      undefined,
      fetchImpl as typeof fetch,
    );

    await vi.advanceTimersByTimeAsync(76_000);
    await expect(result).resolves.toBe('https://example.com/slow-pro-scene.png');
    vi.useRealTimers();
  });
});
