import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CategoryStepPanel from './CategoryStepPanel';

describe('CategoryStepPanel', () => {
  it('shows categories as freely selectable and keeps top length controls for top', () => {
    const onSelectCategory = vi.fn();
    const onSelectTopLength = vi.fn();

    render(
      <CategoryStepPanel
        activeCategory="top"
        completedCategories={[]}
        selectedTopLength={null}
        onSelectCategory={onSelectCategory}
        onSelectTopLength={onSelectTopLength}
        selectedDressLength={null}
        selectedOuterwearLength={null}
        onSelectDressLength={vi.fn()}
        onSelectOuterwearLength={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('Üst Giyim')).toBeInTheDocument();
    expect(screen.getByText('Alt Giyim')).toBeInTheDocument();
    expect(screen.getByText('Üst, alt, ayakkabı veya aksesuar kategorisini istediğiniz sırada seçin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crop' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Kalça' }));
    expect(onSelectTopLength).toHaveBeenCalledWith('hip');

    fireEvent.click(screen.getByRole('button', { name: 'Aksesuar' }));
    expect(onSelectCategory).toHaveBeenCalledWith('accessory');
  });

  it('allows selecting footwear and accessory without ordered progress', () => {
    const onSelectCategory = vi.fn();
    const onSelectTopLength = vi.fn();

    render(
      <CategoryStepPanel
        activeCategory="footwear"
        completedCategories={[]}
        selectedTopLength={null}
        onSelectCategory={onSelectCategory}
        onSelectTopLength={onSelectTopLength}
        selectedDressLength={null}
        selectedOuterwearLength={null}
        onSelectDressLength={vi.fn()}
        onSelectOuterwearLength={vi.fn()}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ayakkabı' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aksesuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Üst Giyim' }));

    expect(onSelectCategory).toHaveBeenCalledWith('footwear');
    expect(onSelectCategory).toHaveBeenCalledWith('accessory');
    expect(onSelectCategory).toHaveBeenCalledWith('top');
  });
});
