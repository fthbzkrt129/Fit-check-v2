/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, DownloadIcon, Undo2Icon, Redo2Icon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  onDownload: () => void;
  canDownload: boolean;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRegenerate: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, onDownload, canDownload, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, availablePoseKeys, canUndo, canRedo, onUndo, onRedo, onRegenerate }) => {
  const [isPoseDrawerOpen, setIsPoseDrawerOpen] = useState(false);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative animate-zoom-in group gap-4">
      <div className="absolute top-4 left-4 z-30 hidden items-center gap-2 md:flex">
        <button
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            className="flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/60 disabled:hover:border-gray-300/80 disabled:active:scale-100"
            aria-label="Geri Al"
        >
            <Undo2Icon className="w-4 h-4 mr-1.5" />
            Geri Al
        </button>
        <button
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            className="flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/60 disabled:hover:border-gray-300/80 disabled:active:scale-100"
            aria-label="Yinele"
        >
            <Redo2Icon className="w-4 h-4 mr-1.5" />
            Yinele
        </button>
        <button
            onClick={onRegenerate}
            disabled={isLoading || !displayImageUrl}
            className="flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/60 disabled:hover:border-gray-300/80 disabled:active:scale-100"
            aria-label="Regenerate"
            title="Render'ı tekrar üret"
        >
            <RotateCcwIcon className="w-4 h-4 mr-1.5" />
            Yeniden Üret
        </button>
        <button
            onClick={onStartOver}
            className="flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm"
        >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            Start Over
        </button>
      </div>

      {/* Image Display or Placeholder */}
      <div className="relative w-full h-full flex items-center justify-center">
        {displayImageUrl ? (
          <img
            key={displayImageUrl} // Use key to force re-render and trigger animation on image change
            src={displayImageUrl}
            alt="Virtual try-on model"
            className="max-w-full max-h-full object-contain transition-opacity duration-500 animate-fade-in rounded-lg"
          />
        ) : (
            <div className="w-[400px] h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-gray-600 mt-4">Loading Model...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg font-serif text-gray-700 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {displayImageUrl && (
        <div className="fixed top-4 left-4 z-30 w-[calc(100vw-2rem)] max-w-sm md:absolute md:inset-x-auto md:top-auto md:bottom-24 md:left-1/2 md:w-auto md:-translate-x-1/2 md:max-w-none">
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsPoseDrawerOpen(true)}
              disabled={isLoading}
              className="inline-flex items-center rounded-full border border-gray-200/80 bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-600 shadow-[0_10px_24px_rgba(0,0,0,0.10)] backdrop-blur-lg disabled:opacity-60"
            >
              Pose
            </button>

            <AnimatePresence>
              {isPoseDrawerOpen && !isLoading && (
                <motion.div
                  className="fixed inset-0 z-40 bg-black/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsPoseDrawerOpen(false)}
                >
                  <motion.aside
                    className="absolute left-0 top-0 h-full w-[82vw] max-w-xs border-r border-gray-200 bg-white p-4 shadow-[16px_0_40px_rgba(0,0,0,0.18)]"
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">Pose</div>
                        <div className="mt-1 text-sm text-gray-600">Kısa ve sade seçim</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPoseDrawerOpen(false)}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
                      >
                        Kapat
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {poseInstructions.map((pose, index) => {
                        const isSelected = index === currentPoseIndex;
                        return (
                          <button
                            key={pose}
                            type="button"
                            onClick={() => {
                              onSelectPose(index);
                              setIsPoseDrawerOpen(false);
                            }}
                            aria-pressed={isSelected}
                            className={`rounded-full border px-3 py-2 text-[12px] font-medium transition-all ${
                              isSelected
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pose}
                          </button>
                        );
                      })}
                    </div>
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:inline-block relative">
            <button
              type="button"
              onClick={() => setIsPoseDrawerOpen((prev) => !prev)}
              disabled={isLoading}
              className="inline-flex items-center rounded-full border border-gray-200/80 bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-600 shadow-[0_10px_24px_rgba(0,0,0,0.10)] backdrop-blur-lg disabled:opacity-60"
            >
              Pose
            </button>

            <AnimatePresence>
              {isPoseDrawerOpen && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute bottom-full left-1/2 mb-3 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-gray-200/80 bg-white/90 p-3 shadow-[0_14px_30px_rgba(0,0,0,0.12)] backdrop-blur-lg"
                >
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">Pose</div>
                  <div className="grid grid-cols-3 gap-2">
                    {poseInstructions.map((pose, index) => {
                      const isSelected = index === currentPoseIndex;
                      return (
                        <button
                          key={pose}
                          type="button"
                          onClick={() => {
                            onSelectPose(index);
                            setIsPoseDrawerOpen(false);
                          }}
                          aria-pressed={isSelected}
                          className={`rounded-full border px-2 py-2 text-[12px] font-medium transition-all ${
                            isSelected
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pose}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {canDownload && (
        <button
          type="button"
          onClick={onDownload}
          disabled={isLoading}
          className="fixed inset-x-4 bottom-4 z-30 w-auto md:static md:w-full md:max-w-2xl flex items-center justify-center gap-3 rounded-[1.25rem] border border-white/10 bg-gradient-to-b from-[#1f1f22] via-[#111214] to-[#050506] px-6 py-4 text-base font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#26262a] hover:via-[#151619] hover:to-[#080809] hover:shadow-[0_24px_52px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-0 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="İndir"
        >
          <DownloadIcon className="h-5 w-5" />
          <span>İndir</span>
        </button>
      )}
    </div>
  );
};

export default Canvas;
