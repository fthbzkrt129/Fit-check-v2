import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Canvas from './Canvas';

describe('Canvas', () => {
  it('renders a persistent pose button before the download button', () => {
    render(
      <Canvas
        displayImageUrl="https://example.com/look.png"
        onStartOver={vi.fn()}
        onDownload={vi.fn()}
        canDownload={true}
        isLoading={false}
        loadingMessage=""
        onSelectPose={vi.fn()}
        poseInstructions={['Front', 'Side']}
        currentPoseIndex={0}
        availablePoseKeys={['Front']}
      />
    );

    const poseButton = screen.getByRole('button', { name: /poz üret/i });
    const downloadButton = screen.getByRole('button', { name: /indir/i });

    expect(poseButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(poseButton.compareDocumentPosition(downloadButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(poseButton.className).toContain('fixed');
  });

  it('opens pose options when the persistent pose button is clicked', () => {
    render(
      <Canvas
        displayImageUrl="https://example.com/look.png"
        onStartOver={vi.fn()}
        onDownload={vi.fn()}
        canDownload={true}
        isLoading={false}
        loadingMessage=""
        onSelectPose={vi.fn()}
        poseInstructions={['Front', 'Side']}
        currentPoseIndex={0}
        availablePoseKeys={['Front']}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /poz üret/i }));

    expect(screen.getByRole('button', { name: 'Side' })).toBeInTheDocument();
  });
});
