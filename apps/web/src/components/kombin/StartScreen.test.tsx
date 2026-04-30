import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import StartScreen from './StartScreen';

const generateModelImageMock = vi.fn();

vi.mock('@/lib/kombin/services/geminiService', () => ({
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
    cleanup();
    vi.clearAllMocks();
    generateModelImageMock.mockResolvedValue('https://example.com/generated-model.png');
    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);
  });

  const generateModel = async (props: Record<string, unknown> = {}) => {
    const onModelFinalized = vi.fn();
    const onExperimentalStyling = vi.fn();

    render(
      <StartScreen
        onModelFinalized={onModelFinalized}
        onExperimentalStyling={onExperimentalStyling}
        {...props}
      />,
    );

    const input = document.querySelector('#image-upload-start') as HTMLInputElement;
    const file = new File(['image'], 'model.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByRole('button', { name: 'Start Styling' });

    return { onModelFinalized, onExperimentalStyling };
  };

  it('renders only the experimental styling entry when a generated model exists', async () => {
    await generateModel();

    expect(screen.getByRole('button', { name: 'Start Styling' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Proceed to Styling →' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Deneysel kombin giydir' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Manken Değiştir' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Use Different Photo' })).toBeNull();
  });

  it('uses design-system classes after a generated model exists', async () => {
    await generateModel();

    expect(document.querySelector('.start-screen--result')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start Styling' }).className).toContain('start-screen__action--primary');
  });

  it('calls the experimental callback with the same generated model URL', async () => {
    const { onModelFinalized, onExperimentalStyling } = await generateModel();

    fireEvent.click(screen.getByRole('button', { name: 'Start Styling' }));

    await waitFor(() => {
      expect(onExperimentalStyling).toHaveBeenCalledWith('https://example.com/generated-model.png');
    });
    expect(onModelFinalized).not.toHaveBeenCalled();
  });

  it('surfaces generation errors and keeps styling actions hidden', async () => {
    generateModelImageMock.mockRejectedValueOnce(new Error('Unsupported image format.'));

    render(
      <StartScreen
        onModelFinalized={vi.fn()}
        onExperimentalStyling={vi.fn()}
      />,
    );

    const input = document.querySelector('#image-upload-start') as HTMLInputElement;
    const file = new File(['image'], 'model.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByText('Failed to create model. Unsupported image format.');

    expect(screen.queryByRole('button', { name: 'Start Styling' })).toBeNull();
  });

  it('keeps the preview shell stable while the model is still generating', async () => {
    let resolveGeneration: ((value: string) => void) | undefined;
    generateModelImageMock.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveGeneration = resolve;
        }),
    );

    render(
      <StartScreen
        onModelFinalized={vi.fn()}
        onExperimentalStyling={vi.fn()}
      />,
    );

    const input = document.querySelector('#image-upload-start') as HTMLInputElement;
    const file = new File(['image'], 'model.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Generating your model...')).toBeTruthy();

    const previewShell = document.querySelector('[data-testid="start-screen-preview-shell"]');
    const actionsContainer = screen.getByTestId('start-screen-actions');

    expect(previewShell?.className).not.toContain('animate-pulse');
    expect(actionsContainer).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Start Styling' })).toBeNull();

    if (resolveGeneration) {
      resolveGeneration('https://example.com/generated-model.png');
    }

    expect(await screen.findByRole('button', { name: 'Start Styling' })).toBeTruthy();
  });
});
