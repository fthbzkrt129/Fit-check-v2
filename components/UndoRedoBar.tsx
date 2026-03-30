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
}

const UndoRedoBar: React.FC<UndoRedoBarProps> = ({ canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <motion.div
      className="flex gap-2 items-center bg-white/95 rounded-lg shadow-md px-3 py-2 backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Undo Button */}
      <motion.button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
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
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
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
    </motion.div>
  );
};

export default UndoRedoBar;
