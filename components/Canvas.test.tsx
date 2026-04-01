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

    const poseLabels = screen.getAllByText('Pose');
    const downloadButton = screen.getByRole('button', { name: 'İndir' });

    expect(poseLabels).toHaveLength(2);
    expect(downloadButton).toBeInTheDocument();
    expect(poseLabels[0].compareDocumentPosition(downloadButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

    fireEvent.click(screen.getAllByRole('button', { name: 'Pose' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Side' })[0]);

    expect(onSelectPose).toHaveBeenCalledWith(1);
  });
});
