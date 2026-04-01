import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Canvas from './Canvas';

describe('Canvas', () => {
  it('renders compact pose chips', () => {
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
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onRegenerate={vi.fn()}
      />
    );

    const poseLabel = screen.getByText('Pose');
    const frontChip = screen.getByRole('button', { name: 'Front' });
    const downloadButton = screen.getByRole('button', { name: /indir/i });

    expect(poseLabel).toBeInTheDocument();
    expect(frontChip).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(poseLabel.compareDocumentPosition(downloadButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(frontChip.className).toContain('rounded-full');
  });

  it('selects a pose chip directly', () => {
    const onSelectPose = vi.fn();

    render(
      <Canvas
        displayImageUrl="https://example.com/look.png"
        onStartOver={vi.fn()}
        onDownload={vi.fn()}
        canDownload={true}
        isLoading={false}
        loadingMessage=""
        onSelectPose={onSelectPose}
        poseInstructions={['Front', 'Side']}
        currentPoseIndex={0}
        availablePoseKeys={['Front']}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onRegenerate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Side' }));

    expect(onSelectPose).toHaveBeenCalledWith(1);
  });
});
