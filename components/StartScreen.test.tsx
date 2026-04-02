import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import StartScreen from './StartScreen';

const generateModelImageMock = vi.fn();

vi.mock('../services/geminiService', () => ({
  generateModelImage: (...args: unknown[]) => generateModelImageMock(...args),
}));

vi.mock('./ui/compare', () => ({
  Compare: ({ firstImage, secondImage }: { firstImage: string; secondImage: string }) => (
    <div data-testid="compare" data-first={firstImage} data-second={secondImage} />
  ),
}));

class MockFileReader {
  public onload: ((event: { target: { result: string } }) => void) | null = null;

  readAsDataURL() {
    this.onload?.({ target: { result: 'data:image/png;base64,mock-user-image' } });
  }
}

describe('StartScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateModelImageMock.mockResolvedValue('https://example.com/generated-model.png');
    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);
  });

  const generateModel = async (props: Record<string, unknown> = {}) => {
    const onModelFinalized = vi.fn();
    const onExperimentalStyling = vi.fn();

    render(
      React.createElement(StartScreen as unknown as React.ElementType, {
        onModelFinalized,
        onExperimentalStyling,
        ...props,
      }),
    );

    const input = document.querySelector('#image-upload-start') as HTMLInputElement;
    const file = new File(['image'], 'model.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByRole('button', { name: 'Proceed to Styling →' });

    return { onModelFinalized, onExperimentalStyling };
  };

  it('renders both styling entry buttons when a generated model exists', async () => {
    await generateModel();

    expect(screen.getByRole('button', { name: 'Proceed to Styling →' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Deneysel kombin giydir' })).toBeTruthy();
  });

  it('keeps the standard styling action isolated from the experimental callback', async () => {
    const { onModelFinalized, onExperimentalStyling } = await generateModel();

    fireEvent.click(screen.getByRole('button', { name: 'Proceed to Styling →' }));

    expect(onModelFinalized).toHaveBeenCalledWith('https://example.com/generated-model.png');
    expect(onExperimentalStyling).not.toHaveBeenCalled();
  });

  it('calls the experimental callback with the same generated model URL', async () => {
    const { onModelFinalized, onExperimentalStyling } = await generateModel();

    fireEvent.click(screen.getByRole('button', { name: 'Deneysel kombin giydir' }));

    await waitFor(() => {
      expect(onExperimentalStyling).toHaveBeenCalledWith('https://example.com/generated-model.png');
    });
    expect(onModelFinalized).not.toHaveBeenCalled();
  });
});
