import React from 'react';
import type { SceneVariation } from '@/lib/kombin/types';

interface SceneVariationListProps {
  variations: SceneVariation[];
  selectedVariationId: string | null;
  onSelectVariation: (id: string) => void;
  isLoading: boolean;
}

const formatLabel = (value: string) => value.replace(/\b\w/g, (char) => char.toUpperCase());

const SceneVariationList: React.FC<SceneVariationListProps> = ({
  variations,
  selectedVariationId,
  onSelectVariation,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-400/50 pt-6">
      <div>
        <h2 className="text-xl font-serif tracking-wider text-gray-800">Scene Variations</h2>
        <p className="mt-1 text-sm text-gray-500">Up to three recent scene results for this outfit.</p>
      </div>

      {variations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500">
          Henüz sahne varyasyonu oluşturulmadı.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {variations.map((variation) => {
            const isSelected = variation.id === selectedVariationId;
            const sceneLabel = formatLabel(variation.scene);
            const lightingLabel = formatLabel(variation.lighting);

            return (
              <button
                key={variation.id}
                type="button"
                onClick={() => onSelectVariation(variation.id)}
                disabled={isLoading}
                className={`flex items-center gap-3 rounded-xl border p-2 text-left transition-all ${
                  isSelected ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                } ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                aria-label={`${sceneLabel} ${lightingLabel}`}
              >
                <img
                  src={variation.imageUrl}
                  alt={`${sceneLabel} ${lightingLabel}`}
                  className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{sceneLabel}</p>
                  <p className="truncate text-xs text-gray-500">{lightingLabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SceneVariationList;
