import React from 'react';
import type { LightingOption, SceneOption, SceneQualityMode } from '../types';

interface ScenePanelProps {
  selectedScene: SceneOption | null;
  selectedLighting: LightingOption | null;
  qualityMode: SceneQualityMode;
  onSelectScene: (scene: SceneOption) => void;
  onSelectLighting: (lighting: LightingOption) => void;
  onChangeQualityMode: (mode: SceneQualityMode) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
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
  onSelectScene,
  onSelectLighting,
  onChangeQualityMode,
  onGenerate,
  isLoading,
  disabled,
}) => {
  const canGenerate = !disabled && !isLoading && !!selectedScene && !!selectedLighting;
  const lightingDisabled = disabled || !selectedScene || isLoading;

  return (
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
  );
};

export default ScenePanel;
