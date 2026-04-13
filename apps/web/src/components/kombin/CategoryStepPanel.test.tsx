import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryStepPanel from './CategoryStepPanel';

describe('CategoryStepPanel', () => {
  beforeEach(() => {
    cleanup();
  });

  it('keeps future categories locked until the current top step has a length', () => {
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
    expect(screen.getByText('Adımları sırayla tamamlayın veya bitirdiğiniz kategoriye geri dönün.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crop' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Kalça' }));
    expect(onSelectTopLength).toHaveBeenCalledWith('hip');

    fireEvent.click(screen.getByRole('button', { name: 'Aksesuar' }));
    expect(onSelectCategory).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Alt Giyim' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aksesuar' })).toBeDisabled();
  });

  it('unlocks the next category after top length selection and allows revisiting completed steps', () => {
    const onSelectCategory = vi.fn();

    render(
      <CategoryStepPanel
        activeCategory="bottom"
        completedCategories={['top', 'outerwear', 'dress', 'bottom']}
        selectedTopLength="hip"
        onSelectCategory={onSelectCategory}
        onSelectTopLength={vi.fn()}
        selectedDressLength={null}
        selectedOuterwearLength={null}
        onSelectDressLength={vi.fn()}
        onSelectOuterwearLength={vi.fn()}
        isLoading={false}
      />
    );

    const footwearButton = screen.getByRole('button', { name: 'Ayakkabı' });
    const completedTopButton = screen.getByRole('button', { name: 'Üst Giyim' });
    const accessoryButton = screen.getByRole('button', { name: 'Aksesuar' });

    expect(footwearButton).not.toBeDisabled();
    expect(completedTopButton).not.toBeDisabled();
    expect(accessoryButton).toBeDisabled();

    fireEvent.click(footwearButton);
    fireEvent.click(completedTopButton);
    fireEvent.click(accessoryButton);

    expect(onSelectCategory).toHaveBeenCalledWith('footwear');
    expect(onSelectCategory).toHaveBeenCalledWith('top');
    expect(onSelectCategory).not.toHaveBeenCalledWith('accessory');
    expect(accessoryButton).toBeDisabled();
  });

  it('keeps dress and outerwear future steps locked until their own lengths are selected', () => {
    const onSelectCategory = vi.fn();

    const { rerender } = render(
      <CategoryStepPanel
        activeCategory="outerwear"
        completedCategories={['top']}
        selectedTopLength="hip"
        onSelectCategory={onSelectCategory}
        onSelectTopLength={vi.fn()}
        selectedDressLength={null}
        selectedOuterwearLength={null}
        onSelectDressLength={vi.fn()}
        onSelectOuterwearLength={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Alt Giyim' })).toBeDisabled();

    rerender(
      <CategoryStepPanel
        activeCategory="dress"
        completedCategories={['top', 'outerwear']}
        selectedTopLength="hip"
        onSelectCategory={onSelectCategory}
        onSelectTopLength={vi.fn()}
        selectedDressLength={null}
        selectedOuterwearLength="short"
        onSelectDressLength={vi.fn()}
        onSelectOuterwearLength={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Ayakkabı' })).toBeDisabled();
  });
});
