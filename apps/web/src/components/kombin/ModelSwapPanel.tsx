import React from 'react';

interface ModelSwapPanelProps {
  currentModelImageUrl: string | null;
  pendingModelImageUrl: string | null;
  onSelectFile: (file: File) => void;
  onApply: () => void;
  isLoading: boolean;
}

const ModelSwapPanel: React.FC<ModelSwapPanelProps> = ({
  currentModelImageUrl,
  pendingModelImageUrl,
  onSelectFile,
  onApply,
  isLoading,
}) => {
  const previewImage = pendingModelImageUrl ?? currentModelImageUrl;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Manken Değiştir</p>
        <h2 className="mt-1 text-xl font-serif text-gray-800">Yeni Manken</h2>
        <p className="mt-1 text-sm text-gray-500">Mevcut kombin korunur, yeni yüklenen kişi baz alınır.</p>
      </div>

      {previewImage && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          <img src={previewImage} alt="Yeni manken önizleme" className="h-48 w-full object-cover" />
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
        Yeni Manken Yükle
        <input
          aria-label="Yeni manken yükle"
          type="file"
          accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSelectFile(file);
            }
          }}
        />
      </label>

      <button
        type="button"
        onClick={onApply}
        disabled={!pendingModelImageUrl || isLoading}
        className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Mankeni Uygula
      </button>
    </section>
  );
};

export default ModelSwapPanel;
