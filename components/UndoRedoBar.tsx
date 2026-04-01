/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { motion } from 'framer-motion';

interface UndoRedoBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onStartOver: () => void;
}

const UndoRedoBar: React.FC<UndoRedoBarProps> = ({ canUndo, canRedo, onUndo, onRedo, onStartOver }) => {
  return (
    <motion.div
      className="flex w-full gap-2 items-center rounded-2xl border border-gray-200 bg-white/95 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md md:w-auto md:rounded-lg md:px-3 md:py-2 md:shadow-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Undo Button */}
      <motion.button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex min-h-11 flex-1 items-center justify-center gap-1 px-3 py-3 rounded-xl transition-all duration-200 md:flex-none md:py-2 md:rounded-lg ${
          canUndo
            ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer active:scale-95 shadow-sm'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={canUndo ? { scale: 1.05 } : {}}
        whileTap={canUndo ? { scale: 0.95 } : {}}
        aria-disabled={!canUndo}
        aria-label="Geri Al (Undo)"
        title="Geri Al"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Geri Al</span>
      </motion.button>

      {/* Redo Button */}
      <motion.button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex min-h-11 flex-1 items-center justify-center gap-1 px-3 py-3 rounded-xl transition-all duration-200 md:flex-none md:py-2 md:rounded-lg ${
          canRedo
            ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer active:scale-95 shadow-sm'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={canRedo ? { scale: 1.05 } : {}}
        whileTap={canRedo ? { scale: 0.95 } : {}}
        aria-disabled={!canRedo}
        aria-label="Yinele (Redo)"
        title="Yinele"
      >
        <span className="text-sm font-medium">Yinele</span>
        <ChevronRightIcon className="h-4 w-4" />
      </motion.button>

      <motion.button
        type="button"
        onClick={onStartOver}
        className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-gray-900 px-3 py-3 text-white transition-all duration-200 hover:bg-gray-800 active:scale-95 md:flex-none md:py-2 md:rounded-lg"
        aria-label="Start Over"
        title="Start Over"
      >
        <span className="text-sm font-medium">Start Over</span>
      </motion.button>
    </motion.div>
  );
};

export default UndoRedoBar;
