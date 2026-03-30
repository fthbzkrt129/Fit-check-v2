/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, Undo2Icon, Redo2Icon } from './icons';
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
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  
  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
    // Fallback if current pose not in available list (shouldn't happen)
    if (currentIndexInAvailable === -1) {
        onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length);
        return;
    }

    const prevIndexInAvailable = (currentIndexInAvailable - 1 + availablePoseKeys.length) % availablePoseKeys.length;
    const prevPoseInstruction = availablePoseKeys[prevIndexInAvailable];
    const newGlobalPoseIndex = poseInstructions.indexOf(prevPoseInstruction);
    
    if (newGlobalPoseIndex !== -1) {
        onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleNextPose = () => {
    if (isLoading) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);

    // Fallback or if there are no generated poses yet
    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
        onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
        return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
        // There is another generated pose, navigate to it
        const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
        const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
        if (newGlobalPoseIndex !== -1) {
            onSelectPose(newGlobalPoseIndex);
        }
    } else {
        // At the end of generated poses, generate the next one from the master list
        const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
        onSelectPose(newGlobalPoseIndex);
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative animate-zoom-in group gap-4">
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
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
        <div className="fixed inset-x-4 bottom-24 z-30 md:absolute md:inset-x-auto md:bottom-24 md:left-1/2 md:-translate-x-1/2">
          <AnimatePresence>
            {isPoseMenuOpen && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute bottom-full left-1/2 mb-3 w-full max-w-sm -translate-x-1/2 rounded-2xl border border-gray-200/80 bg-white/90 p-2 backdrop-blur-lg shadow-lg"
              >
                <div className="grid grid-cols-2 gap-2">
                  {poseInstructions.map((pose, index) => (
                    <button
                      key={pose}
                      onClick={() => {
                        onSelectPose(index);
                        setIsPoseMenuOpen(false);
                      }}
                      disabled={isLoading || index === currentPoseIndex}
                      className="w-full rounded-md p-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-200/70 disabled:cursor-not-allowed disabled:bg-gray-200/70 disabled:font-bold disabled:opacity-50"
                    >
                      {pose}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-[1.25rem] border border-gray-200/80 bg-white/90 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-2 text-sm font-semibold text-gray-800">
              <button
                type="button"
                onClick={() => setIsPoseMenuOpen((prev) => !prev)}
                disabled={isLoading}
                className="flex min-w-0 flex-1 items-center rounded-2xl px-3 py-2 text-left transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Poz Üret"
              >
                <span className="truncate">{poseInstructions[currentPoseIndex]}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500">
                <button
                  type="button"
                  onClick={handlePreviousPose}
                  aria-label="Previous pose"
                  className="rounded-full p-2 transition-all hover:bg-gray-100 active:scale-90 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-800" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPose}
                  aria-label="Next pose"
                  className="rounded-full p-2 transition-all hover:bg-gray-100 active:scale-90 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-800" />
                </button>
              </div>
            </div>
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