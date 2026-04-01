import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StartScreen from './StartScreen';

vi.mock('../services/geminiService', () => ({
  generateModelImage: vi.fn().mockResolvedValue('data:image/png;base64,generated-model'),
}));

describe('StartScreen', () => {
  it('shows both styling and model swap entry actions after model generation', async () => {
    const onModelFinalized = vi.fn();

    render(<StartScreen onModelFinalized={onModelFinalized} />);

    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement;
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /proceed to styling/i })).toBeInTheDocument();
    });

    const modelSwapButton = screen.getByRole('button', { name: /manken değiştir/i });
    expect(modelSwapButton).toBeInTheDocument();

    fireEvent.click(modelSwapButton);

    expect(onModelFinalized).toHaveBeenCalledWith('data:image/png;base64,generated-model', 'modelSwap');
  });
});
