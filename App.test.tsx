import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const geminiServiceMocks = vi.hoisted(() => ({
  generateIdentityReferenceImage: vi.fn(),
  generateVirtualTryOnImage: vi.fn(),
  generateModelSwapImage: vi.fn(),
  generatePoseVariation: vi.fn(),
  generateSceneVariation: vi.fn(),
}));

vi.mock('./services/geminiService', () => geminiServiceMocks);

vi.mock('./components/StartScreen', () => ({
  default: ({ onModelFinalized }: { onModelFinalized: (url: string, target?: 'styling' | 'modelSwap') => void }) => (
    <button onClick={() => onModelFinalized('data:image/png;base64,base-look', 'modelSwap')}>
      Start model swap
    </button>
  ),
}));

vi.mock('./components/ModelSwapPanel', () => ({
  default: ({ onSelectFile, onApply }: { onSelectFile: (file: File) => void; onApply: () => void }) => (
    <div>
      <button onClick={() => onSelectFile(new File(['swap'], 'swap.png', { type: 'image/png' }))}>
        Select swap file
      </button>
      <button onClick={onApply}>Apply swap</button>
    </div>
  ),
}));

vi.mock('./components/Canvas', () => ({
  default: ({ displayImageUrl }: { displayImageUrl: string | null }) => <div>{displayImageUrl}</div>,
}));

vi.mock('./components/UndoRedoBar', () => ({ default: () => null }));
vi.mock('./components/WardrobeModal', () => ({ default: () => null }));
vi.mock('./components/OutfitStack', () => ({ default: () => null }));
vi.mock('./components/CategoryStepPanel', () => ({ default: () => null }));
vi.mock('./components/ScenePanel', () => ({ default: () => null }));
vi.mock('./components/SceneVariationList', () => ({ default: () => null }));
vi.mock('./components/Footer', () => ({ default: () => null }));
vi.mock('./components/Spinner', () => ({ default: () => null }));
vi.mock('./components/icons', () => ({
  ChevronDownIcon: () => null,
  ChevronUpIcon: () => null,
  ChevronLeftIcon: () => null,
  ChevronRightIcon: () => null,
}));
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => 'div' }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./lib/pinnedWardrobe', () => ({
  addPinnedWardrobeItem: vi.fn(),
  getPinnedWardrobeItems: vi.fn(() => []),
}));

vi.mock('./lib/sessionStorage', () => ({
  saveSession: vi.fn(),
  loadSession: vi.fn(() => null),
  clearSession: vi.fn(),
}));

vi.mock('./src/lib/sessionPersistence', () => ({
  saveSessionState: vi.fn(),
  restoreSessionState: vi.fn(() => null),
  clearSessionData: vi.fn(),
}));

import App from './App';

describe('App model swap flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    geminiServiceMocks.generateIdentityReferenceImage.mockResolvedValue('data:image/png;base64,identity-ref');
    geminiServiceMocks.generateVirtualTryOnImage.mockResolvedValue('data:image/png;base64,replayed-look');
    geminiServiceMocks.generateModelSwapImage.mockResolvedValue('data:image/png;base64,swapped-look');

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('uses a two-stage model swap flow with the current look as reference', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start model swap/i }));
    fireEvent.click(screen.getByRole('button', { name: /select swap file/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply swap/i }));

    await waitFor(() => {
      expect(geminiServiceMocks.generateIdentityReferenceImage).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'swap.png' }),
      );

      expect(geminiServiceMocks.generateModelSwapImage).toHaveBeenCalledWith(
        'data:image/png;base64,base-look',
        'data:image/png;base64,identity-ref',
      );
    });

    expect(geminiServiceMocks.generateVirtualTryOnImage).not.toHaveBeenCalled();
  });
});
