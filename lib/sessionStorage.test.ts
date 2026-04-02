import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionData } from './sessionStorage';
import { clearSession, loadSession, saveSession } from './sessionStorage';

const STORAGE_KEY = 'fit-check-session';

const createSessionData = (overrides: Partial<SessionData> = {}): SessionData => ({
  currentOutfitIndex: 0,
  currentPoseIndex: 0,
  sceneVariations: [],
  activeCategory: 'top',
  selectedTopLength: null,
  wardrobeUserItems: [],
  outfitLayerMeta: [],
  hasModel: false,
  ...overrides,
});

describe('sessionStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves session data to localStorage', () => {
    const data = createSessionData({ hasModel: true });

    saveSession(data);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(data));
  });

  it('loads session data from localStorage', () => {
    const data = createSessionData({ currentPoseIndex: 2 });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    expect(loadSession()).toEqual(data);
  });

  it('returns null when no session exists', () => {
    expect(loadSession()).toBeNull();
  });

  it('clears session data from localStorage', () => {
    const data = createSessionData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    clearSession();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns null when session data is corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-valid-json');

    expect(loadSession()).toBeNull();
  });

  it('does not crash on quota exceeded error', () => {
    const data = createSessionData();
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    saveSession(data);

    expect(warnSpy).toHaveBeenCalled();
    spy.mockRestore();
    warnSpy.mockRestore();
  });

  it('saves outfit layer metadata without image data', () => {
    const data = createSessionData({
      outfitLayerMeta: [
        { garmentId: null, garmentName: null, category: 'base', topLength: null },
        { garmentId: 'shirt-1', garmentName: 'Blue Shirt', category: 'top', topLength: 'waist' },
      ],
      hasModel: true,
      currentOutfitIndex: 1,
    });

    saveSession(data);
    const loaded = loadSession();

    expect(loaded?.outfitLayerMeta).toHaveLength(2);
    expect(loaded?.outfitLayerMeta[1].garmentName).toBe('Blue Shirt');
  });

  it('stores session data without large image URLs in wardrobe', () => {
    const data = createSessionData({
      wardrobeUserItems: [
        { id: '1', name: 'Shirt', url: 'https://example.com/shirt.jpg', source: 'user' },
      ],
    });

    saveSession(data);
    const loaded = loadSession();

    expect(loaded?.wardrobeUserItems[0].url).toBe('https://example.com/shirt.jpg');
  });
});
