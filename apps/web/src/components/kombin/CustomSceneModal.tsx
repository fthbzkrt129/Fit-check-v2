/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface CustomSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customPrompt: string) => void;
  isLoading?: boolean;
}

const CustomSceneModal: React.FC<CustomSceneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleSubmit = () => {
    if (customPrompt.trim()) {
      onSubmit(customPrompt.trim());
      setCustomPrompt('');
    }
  };

  const handleCancel = () => {
    setCustomPrompt('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Kendi Ortamını Oluştur</h2>
        <p className="mt-1 text-sm text-gray-600">
          Modelinin hangi ortamda görüneceğini açıkla.
        </p>

        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Örn: Deniz kenarı yürüyüşü, güneş batarken..."
          disabled={isLoading}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
          rows={4}
        />

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!customPrompt.trim() || isLoading}
            className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomSceneModal;
