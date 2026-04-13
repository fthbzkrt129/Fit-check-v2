import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __private__,
  generateIdentityReferenceImage,
  generateModelImage,
  generateModelSwapImage,
  generatePoseVariation,
  generateSceneVariation,
  generateVirtualTryOnImage,
} from './services/geminiService';

describe('generateModelImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('posts the user image to the secure model endpoint and returns the generated image url', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/generated-model.png' }),
    } as Response);

    await expect(__private__.requestModelImage('data:image/png;base64,mock-user-image')).resolves.toBe('https://example.com/generated-model.png');

    expect(fetchSpy).toHaveBeenCalledWith('/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });
  });

  it('preserves the server error text for failed model requests', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      text: async () => 'Unsupported image format.',
    } as Response);

    await expect(__private__.requestModelImage('data:image/png;base64,mock-user-image')).rejects.toThrow(
      'Unsupported image format.',
    );
  });

  it('converts the input file to a data url before posting to the secure model endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/generated-model.png' }),
    });

    const file = new File(['image'], 'model.png', { type: 'image/png' });
    const toDataUrl = vi.fn().mockResolvedValue('data:image/png;base64,mock-user-image');

    await expect(generateModelImage(file, fetchImpl as typeof fetch, toDataUrl)).resolves.toBe(
      'https://example.com/generated-model.png',
    );

    expect(toDataUrl).toHaveBeenCalledWith(file);
    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        userImage: 'data:image/png;base64,mock-user-image',
      }),
    });
  });

  it('resolves the workspace slug from the local /dev/[slug] development shortcut', () => {
    expect(__private__.resolveWorkspaceSlug({ pathname: '/dev/demo', hostname: 'localhost' } as Location)).toBe('demo');
  });
});

describe('generateVirtualTryOnImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('posts standard try-on requests to the secure endpoint with workspace and length metadata', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/try-on.png' }),
    });

    const garmentFile = new File(['garment'], 'garment.png', { type: 'image/png' });
    const toDataUrl = vi.fn().mockResolvedValue('data:image/png;base64,garment');
    const normalizeModelImage = vi.fn().mockResolvedValue('data:image/png;base64,model');

    await expect(
      __private__.requestTryOnImage(
        'https://example.com/model.png',
        garmentFile,
        'outerwear',
        null,
        null,
        'long',
        fetchImpl as typeof fetch,
        normalizeModelImage,
        toDataUrl,
      ),
    ).resolves.toBe('https://example.com/try-on.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/try-on', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        modelImage: 'data:image/png;base64,model',
        garmentImage: 'data:image/png;base64,garment',
        category: 'outerwear',
        topLength: null,
        dressLength: null,
        outerwearLength: 'long',
      }),
    });
  });

  it('uses the public helper with the same secure request path', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/try-on.png' }),
    });
    const toDataUrl = vi.fn().mockResolvedValue('data:image/png;base64,garment');
    const normalizeModelImage = vi.fn().mockResolvedValue('data:image/png;base64,model');

    await expect(
      generateVirtualTryOnImage(
        'https://example.com/model.png',
        new File(['garment'], 'garment.png', { type: 'image/png' }),
        'dress',
        null,
        'midi',
        null,
        fetchImpl as typeof fetch,
        normalizeModelImage,
        toDataUrl,
      ),
    ).resolves.toBe('https://example.com/try-on.png');

    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});

describe('advanced secure image flows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/workspace/demo');
  });

  it('posts pose changes to the secure pose endpoint with the active image', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/pose.png' }),
    });
    const normalizeTryOnImage = vi.fn().mockResolvedValue('data:image/png;base64,look');

    await expect(
      generatePoseVariation(
        'https://example.com/look.png',
        'Walking towards camera',
        fetchImpl as typeof fetch,
        normalizeTryOnImage,
      ),
    ).resolves.toBe('https://example.com/pose.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/pose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        tryOnImage: 'data:image/png;base64,look',
        poseInstruction: 'Walking towards camera',
      }),
    });
  });

  it('posts scene generations to the secure scene endpoint with current quality mode', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/scene.png' }),
    });
    const normalizeBaseImage = vi.fn().mockResolvedValue('data:image/png;base64,look');

    await expect(
      generateSceneVariation(
        'https://example.com/look.png',
        'street',
        'golden hour',
        'pro',
        'rooftop terrace',
        fetchImpl as typeof fetch,
        normalizeBaseImage,
      ),
    ).resolves.toBe('https://example.com/scene.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/scene', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        baseImage: 'data:image/png;base64,look',
        scene: 'street',
        lighting: 'golden hour',
        mode: 'pro',
        customPrompt: 'rooftop terrace',
      }),
    });
  });

  it('routes identity reference generation through the secure model endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/identity.png' }),
    });
    const toDataUrl = vi.fn().mockResolvedValue('data:image/png;base64,identity-input');
    const file = new File(['identity'], 'identity.png', { type: 'image/png' });

    await expect(
      generateIdentityReferenceImage(file, fetchImpl as typeof fetch, toDataUrl),
    ).resolves.toBe('https://example.com/identity.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        operation: 'identity-reference',
        userImage: 'data:image/png;base64,identity-input',
      }),
    });
  });

  it('routes model swap generation through the secure model endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/swapped.png' }),
    });
    const normalizeReference = vi.fn().mockResolvedValue('data:image/png;base64,reference');
    const normalizeIdentity = vi.fn().mockResolvedValue('data:image/png;base64,identity');

    await expect(
      generateModelSwapImage(
        'https://example.com/reference.png',
        'https://example.com/identity.png',
        fetchImpl as typeof fetch,
        normalizeReference,
        normalizeIdentity,
      ),
    ).resolves.toBe('https://example.com/swapped.png');

    expect(fetchImpl).toHaveBeenCalledWith('/api/ai/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceSlug: 'demo',
        operation: 'swap',
        referenceLookImage: 'data:image/png;base64,reference',
        identityReferenceImage: 'data:image/png;base64,identity',
      }),
    });
  });
});
