import React from 'react';
import type { GarmentCategory, TopLengthOption, DressLengthOption, OuterwearLengthOption } from '@/lib/kombin/types';
import { CATEGORY_LABELS, TOP_LENGTH_LABELS, DRESS_LENGTH_LABELS, OUTERWEAR_LENGTH_LABELS, isCategorySelectionAllowed } from '@/lib/kombin/outfitFlow';

interface CategoryStepPanelProps {
  activeCategory: GarmentCategory;
  completedCategories: GarmentCategory[];
  selectedTopLength: TopLengthOption | null;
  selectedDressLength: DressLengthOption | null;
  selectedOuterwearLength: OuterwearLengthOption | null;
  onSelectCategory: (category: GarmentCategory) => void;
  onSelectTopLength: (length: TopLengthOption) => void;
  onSelectDressLength: (length: DressLengthOption) => void;
  onSelectOuterwearLength: (length: OuterwearLengthOption) => void;
  isLoading: boolean;
}

const categoryOrder: GarmentCategory[] = ['top', 'outerwear', 'dress', 'bottom', 'footwear', 'accessory'];
const topLengths: TopLengthOption[] = ['crop', 'waist', 'hip', 'tunic'];
const dressLengths: DressLengthOption[] = ['knee', 'midi', 'maxi', 'floor'];
const outerwearLengths: OuterwearLengthOption[] = ['short', 'medium', 'long'];

const CategoryStepPanel: React.FC<CategoryStepPanelProps> = ({
  activeCategory,
  completedCategories,
  selectedTopLength,
  selectedDressLength,
  selectedOuterwearLength,
  onSelectCategory,
  onSelectTopLength,
  onSelectDressLength,
  onSelectOuterwearLength,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-4 border-t border-gray-400/50 pt-6">
      <div>
        <h2 className="text-xl font-serif tracking-wider text-gray-800">Kombin Akışı</h2>
        <p className="mt-1 text-sm text-gray-500">Adımları sırayla tamamlayın veya bitirdiğiniz kategoriye geri dönün.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categoryOrder.map((category) => {
          const isActive = category === activeCategory;
          const isCompleted = completedCategories.includes(category);
          const isAllowed = isCategorySelectionAllowed(
            activeCategory,
            category,
            selectedTopLength,
            selectedDressLength,
            selectedOuterwearLength,
            completedCategories,
          );

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              disabled={isLoading || !isAllowed}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : isCompleted
                    ? 'border-gray-300 bg-gray-100 text-gray-700'
                    : isAllowed
                      ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
              } ${isLoading || !isAllowed ? 'cursor-not-allowed opacity-50' : ''}`}
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

      {activeCategory === 'dress' && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Elbise Boyu</p>
          <div className="grid grid-cols-2 gap-2">
            {dressLengths.map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => onSelectDressLength(length)}
                disabled={isLoading}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  selectedDressLength === length
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {DRESS_LENGTH_LABELS[length]}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCategory === 'outerwear' && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Dış Giyim Boyu</p>
          <div className="grid grid-cols-2 gap-2">
            {outerwearLengths.map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => onSelectOuterwearLength(length)}
                disabled={isLoading}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  selectedOuterwearLength === length
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {OUTERWEAR_LENGTH_LABELS[length]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryStepPanel;
