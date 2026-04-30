import React, { useState } from 'react';
import type { LightingOption, SceneOption, SceneProvider, SceneQualityMode } from '@/lib/kombin/types';
import CustomSceneModal from './CustomSceneModal';

interface ScenePanelProps {
  selectedScene: SceneOption | null;
  selectedLighting: LightingOption | null;
  qualityMode: SceneQualityMode;
  sceneProvider: SceneProvider;
  onSelectScene: (scene: SceneOption) => void;
  onSelectLighting: (lighting: LightingOption) => void;
  onChangeQualityMode: (mode: SceneQualityMode) => void;
  onChangeSceneProvider: (provider: SceneProvider) => void;
  onSelectCustomScene: (customPrompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
  hasCustomScene?: boolean;
}

const sceneOptions: { value: SceneOption; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'street', label: 'Street' },
  { value: 'luxury room', label: 'Luxury Room' },
];

const lightingOptions: { value: LightingOption; label: string }[] = [
  { value: 'soft daylight', label: 'Soft Daylight' },
  { value: 'golden hour', label: 'Golden Hour' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'editorial', label: 'Editorial' },
];

const buttonClassName = (isSelected: boolean, isDisabled = false) =>
  `rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
    isSelected
      ? 'border-gray-900 bg-gray-900 text-white'
      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
  } ${isDisabled ? 'cursor-not-allowed opacity-50 hover:border-gray-300 hover:bg-white' : ''}`;

const ScenePanel: React.FC<ScenePanelProps> = ({
  selectedScene,
  selectedLighting,
  qualityMode,
  sceneProvider,
  onSelectScene,
  onSelectLighting,
  onChangeQualityMode,
  onChangeSceneProvider,
  onSelectCustomScene,
  onGenerate,
  isLoading,
  disabled,
  hasCustomScene = false,
}) => {
  const [isCustomSceneModalOpen, setIsCustomSceneModalOpen] = useState(false);
  const hasSceneDirection = !!selectedScene || hasCustomScene;
  const canGenerate = !disabled && !isLoading && hasSceneDirection && !!selectedLighting;
  const lightingDisabled = disabled || !hasSceneDirection || isLoading;

  const handleCustomSceneSubmit = (customPrompt: string) => {
    onSelectCustomScene(customPrompt);
    setIsCustomSceneModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-t border-gray-400/50 pt-6">
        <div>
          <h2 className="text-xl font-serif tracking-wider text-gray-800">Scene</h2>
          <p className="mt-1 text-sm text-gray-500">Pick a setting and lighting style for your current outfit.</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Mode</p>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            {(['fast', 'pro'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeQualityMode(mode)}
                disabled={disabled || isLoading}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${qualityMode === mode ? 'bg-gray-900 text-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900'} ${disabled || isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-pressed={qualityMode === mode}
              >
                {mode === 'fast' ? 'Fast' : 'Pro'}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {qualityMode === 'fast' ? 'Fast: hızlı üretim' : 'Pro: daha sadık ve premium scene üretimi'}
          </p>
        </div>

        <div className="rounded-[8px] border border-black bg-white p-3 text-black shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.54px] text-black/60">GPT Image 2</p>
              <p className="mt-1 text-sm font-light tracking-[-0.14px]">Açıkken sahne üretimi Gemini yerine GPT ile yapılır.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sceneProvider === 'gpt-image-2'}
              onClick={() => onChangeSceneProvider(sceneProvider === 'gpt-image-2' ? 'gemini' : 'gpt-image-2')}
              disabled={disabled || isLoading}
              className={`relative h-7 w-12 rounded-full border border-black transition focus:outline focus:outline-2 focus:outline-dashed focus:outline-black disabled:cursor-not-allowed disabled:opacity-50 ${sceneProvider === 'gpt-image-2' ? 'bg-black' : 'bg-white'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full border border-black bg-white transition-transform ${sceneProvider === 'gpt-image-2' ? 'translate-x-[21px]' : 'translate-x-1'}`} />
              <span className="sr-only">GPT Image 2 ile sahne oluştur</span>
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Step 1 · Scene</p>
          <div className="grid grid-cols-2 gap-2">
            {sceneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectScene(option.value)}
                disabled={disabled || isLoading}
                className={buttonClassName(selectedScene === option.value, disabled || isLoading)}
                aria-pressed={selectedScene === option.value}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomSceneModalOpen(true)}
              disabled={disabled || isLoading}
              className={buttonClassName(hasCustomScene, disabled || isLoading)}
              aria-pressed={hasCustomScene}
            >
              Özel Ortam
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Step 2 · Lighting</p>
          <div className="grid grid-cols-2 gap-2">
            {lightingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectLighting(option.value)}
                disabled={lightingDisabled}
                className={buttonClassName(selectedLighting === option.value, lightingDisabled)}
                aria-pressed={selectedLighting === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Sahne Oluştur
        </button>
      </div>

      <CustomSceneModal
        isOpen={isCustomSceneModalOpen}
        onClose={() => setIsCustomSceneModalOpen(false)}
        onSubmit={handleCustomSceneSubmit}
        isLoading={isLoading}
      />
    </>
  );
};

export default ScenePanel;
