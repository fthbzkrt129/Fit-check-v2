import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScenePanel from './ScenePanel';

afterEach(cleanup);

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
        sceneProvider="gemini"
        onSelectScene={onSelectScene}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={onSelectCustomScene}
        onChangeQualityMode={onChangeQualityMode}
        onChangeSceneProvider={vi.fn()}
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
        sceneProvider="gemini"
        onSelectScene={onSelectScene}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={onSelectCustomScene}
        onChangeQualityMode={onChangeQualityMode}
        onChangeSceneProvider={vi.fn()}
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
        sceneProvider="gemini"
        onSelectScene={onSelectScene}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={onSelectCustomScene}
        onChangeQualityMode={onChangeQualityMode}
        onChangeSceneProvider={vi.fn()}
        onGenerate={onGenerate}
        isLoading={false}
        disabled={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Sahne Oluştur' })).toBeEnabled();
  });

  it('allows lighting and generation when a custom scene is selected without a preset scene', () => {
    const onSelectLighting = vi.fn();

    render(
      <ScenePanel
        selectedScene={null}
        selectedLighting="editorial"
        qualityMode="fast"
        sceneProvider="gpt-image-2"
        onSelectScene={vi.fn()}
        onSelectLighting={onSelectLighting}
        onSelectCustomScene={vi.fn()}
        onChangeQualityMode={vi.fn()}
        onChangeSceneProvider={vi.fn()}
        onGenerate={vi.fn()}
        isLoading={false}
        disabled={false}
        hasCustomScene
      />
    );

    expect(screen.getByRole('button', { name: 'Golden Hour' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sahne Oluştur' })).toBeEnabled();
  });
});
