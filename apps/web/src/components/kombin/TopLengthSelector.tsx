import React from 'react';
import type { TopLengthOption } from '@/lib/kombin/types';
import { TOP_LENGTH_LABELS } from '@/lib/kombin/outfitFlow';

interface TopLengthSelectorProps {
  selectedTopLength: TopLengthOption | null;
  onSelectTopLength: (length: TopLengthOption) => void;
  isLoading: boolean;
}

const topLengths: TopLengthOption[] = ['crop', 'waist', 'hip', 'tunic'];

const TopLengthSelector: React.FC<TopLengthSelectorProps> = ({
  selectedTopLength,
  onSelectTopLength,
  isLoading,
}) => {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Üst Giyim Boyu</p>
      <div className="grid grid-cols-2 gap-2">
        {topLengths.map((length) => (
          <button
            key={length}
            type="button"
            onClick={() => onSelectTopLength(length)}
            disabled={isLoading}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              selectedTopLength === length
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {TOP_LENGTH_LABELS[length]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopLengthSelector;
