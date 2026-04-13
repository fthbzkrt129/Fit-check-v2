import { beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreSessionState, saveSessionState } from './sessionPersistence';

describe('sessionPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('drops heavy image payloads before saving to localStorage', () => {
    saveSessionState({
      modelImageUrl: 'data:image/png;base64,heavy-model',
      outfitHistory: [
        {
          garment: null,
          category: 'base',
          poseImages: { front: 'data:image/png;base64,heavy-look' },
        },
      ],
      currentOutfitIndex: 1,
      currentPoseIndex: 2,
      sceneVariations: [
        {
          id: 'scene-1',
          outfitIndex: 0,
          scene: 'studio',
          lighting: 'soft daylight',
          imageUrl: 'data:image/png;base64,heavy-scene',
          sourcePose: 'front',
          createdAt: 1,
        },
      ],
      pinnedWardrobe: [],
      activeCategory: 'dress',
      selectedTopLength: null,
      selectedDressLength: 'midi',
      selectedOuterwearLength: null,
      stylingMode: 'experimental',
      stagedExperimentalGarments: [
        {
          id: 'dress-1',
          name: 'Dress One',
          category: 'dress',
          source: 'data:image/png;base64,dress',
        },
      ],
    });

    const restored = restoreSessionState();

    expect(restored).toMatchObject({
      modelImageUrl: null,
      outfitHistory: [],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      activeCategory: 'dress',
      selectedDressLength: 'midi',
      stylingMode: 'experimental',
      stagedExperimentalGarments: [
        {
          id: 'dress-1',
          name: 'Dress One',
          category: 'dress',
          source: 'data:image/png;base64,dress',
        },
      ],
    });
  });

  it('ignores parseable but invalid session shapes', () => {
    localStorage.setItem('fit-check-session-v2', JSON.stringify({
      modelImageUrl: null,
      outfitHistory: 'not-an-array',
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [],
      activeCategory: 'top',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'standard',
      stagedExperimentalGarments: [],
    }));

    expect(restoreSessionState()).toBeNull();
  });

  it('ignores nested malformed session payloads', () => {
    localStorage.setItem('fit-check-session-v2', JSON.stringify({
      modelImageUrl: null,
      outfitHistory: [{ garment: null, category: 'base', poseImages: 'invalid' }],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [],
      activeCategory: 'top',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'standard',
      stagedExperimentalGarments: [],
    }));

    expect(restoreSessionState()).toBeNull();
  });

  it('defaults missing experimental session fields for older persisted payloads', () => {
    localStorage.setItem('fit-check-session-v2', JSON.stringify({
      modelImageUrl: 'https://example.com/model.png',
      outfitHistory: [{ garment: null, category: 'base', poseImages: { front: 'https://example.com/model.png' } }],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [],
      activeCategory: 'top',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
    }));

    expect(restoreSessionState()).toMatchObject({
      stylingMode: 'standard',
      stagedExperimentalGarments: [],
    });
  });

  it('retries with a slimmer payload when localStorage quota is exceeded', () => {
    const oversizedDataUrl = `data:image/png;base64,${'a'.repeat(5000)}`;
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementationOnce(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      })
      .mockImplementationOnce(() => undefined);

    saveSessionState({
      modelImageUrl: null,
      outfitHistory: [],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [
        { id: 'pinned-1', name: 'Pinned', url: oversizedDataUrl, category: 'top', source: 'user', isPinned: true },
      ],
      activeCategory: 'top',
      selectedTopLength: null,
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'experimental',
      stagedExperimentalGarments: [
        { id: 'stage-1', name: 'Stage 1', category: 'top', source: oversizedDataUrl },
      ],
    });

    expect(setItem).toHaveBeenCalledTimes(2);
    const retryPayload = JSON.parse(setItem.mock.calls[1]?.[1] as string);
    expect(retryPayload.pinnedWardrobe).toEqual([]);
    expect(retryPayload.stagedExperimentalGarments).toEqual([]);
  });

  it('rejects tampered enum values in persisted session state', () => {
    localStorage.setItem('fit-check-session-v2', JSON.stringify({
      modelImageUrl: null,
      outfitHistory: [],
      currentOutfitIndex: 0,
      currentPoseIndex: 0,
      sceneVariations: [],
      pinnedWardrobe: [],
      activeCategory: 'invalid-category',
      selectedTopLength: 'invalid-length',
      selectedDressLength: null,
      selectedOuterwearLength: null,
      stylingMode: 'standard',
      stagedExperimentalGarments: [],
    }));

    expect(restoreSessionState()).toBeNull();
  });
});
