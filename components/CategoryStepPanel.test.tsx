import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CategoryStepPanel from './CategoryStepPanel';

describe('CategoryStepPanel', () => {
  it('shows top category as active and requires length selection before continuing', () => {
    const onSelectCategory = vi.fn();
    const onSelectTopLength = vi.fn();

    render(
      <CategoryStepPanel
        activeCategory="top"
        completedCategories={[]}
        selectedTopLength={null}
        onSelectCategory={onSelectCategory}
        onSelectTopLength={onSelectTopLength}
        isLoading={false}
      />
    );

    expect(screen.getByText('Üst Giyim')).toBeInTheDocument();
    expect(screen.getByText('Alt Giyim')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crop' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Kalça' }));
    expect(onSelectTopLength).toHaveBeenCalledWith('hip');

    fireEvent.click(screen.getByRole('button', { name: 'Alt Giyim' }));
    expect(onSelectCategory).toHaveBeenCalledWith('bottom');
  });

  it('shows footwear and accessory steps after bottom category', () => {
    const onSelectCategory = vi.fn();
    const onSelectTopLength = vi.fn();

    render(
      <CategoryStepPanel
        activeCategory="footwear"
        completedCategories={['top', 'bottom']}
        selectedTopLength="hip"
        onSelectCategory={onSelectCategory}
        onSelectTopLength={onSelectTopLength}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ayakkabı' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aksesuar' }));

    expect(onSelectCategory).toHaveBeenCalledWith('footwear');
    expect(onSelectCategory).toHaveBeenCalledWith('accessory');
  });
});
