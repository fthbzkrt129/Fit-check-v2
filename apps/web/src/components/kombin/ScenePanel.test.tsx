import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ScenePanel from './ScenePanel';

describe('ScenePanel', () => {
  it('keeps generate button disabled until scene and lighting are selected', () => {
    const onSelectScene = vi.fn();
    const onSelectLighting = vi.fn();
    const onSelectCustomScene = vi.fn();
    const onChangeQualityMode = vi.fn();
    const onGenerate = vi.fn();

    const { rerender } = render(
      <ScenePanel
        selectedScene={null}
        selectedLighting={null}
        qualityMode="fast"
        onSelectScene={onSelectScene}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={onSelectCustomScene}
        onChangeQualityMode={onChangeQualityMode}
        onGenerate={onGenerate}
        isLoading={false}
        disabled={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Sahne Oluştur' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Studio' }));
    expect(onSelectScene).toHaveBeenCalledWith('studio');

    rerender(
      <ScenePanel
        selectedScene="studio"
        selectedLighting={null}
        qualityMode="fast"
        onSelectScene={onSelectScene}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={onSelectCustomScene}
        onChangeQualityMode={onChangeQualityMode}
        onGenerate={onGenerate}
        isLoading={false}
        disabled={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Sahne Oluştur' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Golden Hour' }));
    expect(onSelectLighting).toHaveBeenCalledWith('golden hour');

    rerender(
      <ScenePanel
        selectedScene="studio"
        selectedLighting="golden hour"
        qualityMode="fast"
        onSelectScene={onSelectScene}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={onSelectCustomScene}
        onChangeQualityMode={onChangeQualityMode}
        onGenerate={onGenerate}
        isLoading={false}
        disabled={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Sahne Oluştur' })).toBeEnabled();
  });
});
