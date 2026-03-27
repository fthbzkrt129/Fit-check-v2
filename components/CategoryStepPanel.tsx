import React from 'react';
import type { GarmentCategory, TopLengthOption } from '../types';
import { CATEGORY_LABELS, TOP_LENGTH_LABELS } from '../lib/outfitFlow';

interface CategoryStepPanelProps {
  activeCategory: GarmentCategory;
  completedCategories: GarmentCategory[];
  selectedTopLength: TopLengthOption | null;
  onSelectCategory: (category: GarmentCategory) => void;
  onSelectTopLength: (length: TopLengthOption) => void;
  isLoading: boolean;
}

const categoryOrder: GarmentCategory[] = ['top', 'bottom', 'footwear', 'accessory'];
const topLengths: TopLengthOption[] = ['crop', 'waist', 'hip', 'tunic'];

const CategoryStepPanel: React.FC<CategoryStepPanelProps> = ({
  activeCategory,
  completedCategories,
  selectedTopLength,
  onSelectCategory,
  onSelectTopLength,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-4 border-t border-gray-400/50 pt-6">
      <div>
        <h2 className="text-xl font-serif tracking-wider text-gray-800">Kombin Akışı</h2>
        <p className="mt-1 text-sm text-gray-500">Sırayla üst, alt, ayakkabı ve aksesuar ekleyin.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categoryOrder.map((category) => {
          const isActive = category === activeCategory;
          const isCompleted = completedCategories.includes(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              disabled={isLoading}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : isCompleted
                    ? 'border-gray-300 bg-gray-100 text-gray-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      {activeCategory === 'top' && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Ürün Boyu</p>
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
      )}
    </div>
  );
};

export default CategoryStepPanel;
