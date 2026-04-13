import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ModelSwapPanel from './ModelSwapPanel';

describe('ModelSwapPanel', () => {
  it('accepts a new model upload and enables apply action', () => {
    const onSelectFile = vi.fn();
    const onApply = vi.fn();

    const { rerender } = render(
      <ModelSwapPanel
        currentModelImageUrl="data:image/png;base64,current"
        pendingModelImageUrl={null}
        onSelectFile={onSelectFile}
        onApply={onApply}
        isLoading={false}
      />
    );

    const input = screen.getByLabelText(/yeni manken yükle/i) as HTMLInputElement;
    const file = new File(['swap'], 'swap.png', { type: 'image/png' });

    expect(screen.getByRole('button', { name: /mankeni uygula/i })).toBeDisabled();

    fireEvent.change(input, { target: { files: [file] } });
    expect(onSelectFile).toHaveBeenCalledWith(file);

    rerender(
      <ModelSwapPanel
        currentModelImageUrl="data:image/png;base64,current"
        pendingModelImageUrl="data:image/png;base64,pending"
        onSelectFile={onSelectFile}
        onApply={onApply}
        isLoading={false}
      />
    );

    const applyButton = screen.getByRole('button', { name: /mankeni uygula/i });
    expect(applyButton).toBeEnabled();

    fireEvent.click(applyButton);
    expect(onApply).toHaveBeenCalled();
  });
});
