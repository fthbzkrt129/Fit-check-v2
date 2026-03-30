/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import OutfitStack from './components/OutfitStack';
import CategoryStepPanel from './components/CategoryStepPanel';
import ScenePanel from './components/ScenePanel';
import SceneVariationList from './components/SceneVariationList';
import { generateSceneVariation, generateVirtualTryOnImage, generatePoseVariation } from './services/geminiService';
import { GarmentCategory, DressLengthOption, OuterwearLengthOption, LightingOption, OutfitLayer, SceneOption, SceneQualityMode, SceneVariation, TopLengthOption, WardrobeItem } from './types';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from './components/icons';
import { defaultWardrobe } from './wardrobe';
import Footer from './components/Footer';
import { getFriendlyErrorMessage } from './lib/utils';
import { CATEGORY_LABELS, getNextCategory, isCategorySelectionAllowed } from './lib/outfitFlow';
import { addSceneVariationWithLimit, getPoseGenerationBaseImage, getSceneGenerationBaseImage } from './lib/sceneVariations';
import { downloadImage } from './lib/downloadImage';
import { blobUrlToDataUrl } from './lib/imagePersistence';
import { POSE_OPTIONS } from './lib/poseOptions';
import { addPinnedWardrobeItem, getPinnedWardrobeItems } from './lib/pinnedWardrobe';
import { saveSession, loadSession, clearSession } from './lib/sessionStorage';
import type { SessionData } from './lib/sessionStorage';
import { saveSessionState, restoreSessionState, clearSessionData } from './src/lib/sessionPersistence';
import type { SessionState } from './src/lib/sessionPersistence';
import Spinner from './components/Spinner';

const POSE_INSTRUCTIONS = POSE_OPTIONS.map((pose) => pose.instruction);
const POSE_LABELS = POSE_OPTIONS.map((pose) => pose.label);

const getPoseInstructionByIndex = (index: number) => POSE_INSTRUCTIONS[index];
const getPoseLabelByIndex = (index: number) => POSE_LABELS[index];

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // DEPRECATED: mediaQueryList.addListener(listener);
    mediaQueryList.addEventListener('change', listener);
    
    // Check again on mount in case it changed between initial state and effect runs
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      // DEPRECATED: mediaQueryList.removeListener(listener);
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};


const initialSession = loadSession();

const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(initialSession?.currentOutfitIndex ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(initialSession?.currentPoseIndex ?? 0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    const userItems = initialSession?.wardrobeUserItems ?? [];
    return [...defaultWardrobe, ...getPinnedWardrobeItems(), ...userItems.filter(i => i.source === 'user')];
  });
  const [activeCategory, setActiveCategory] = useState<GarmentCategory>(initialSession?.activeCategory ?? 'top');
  const [selectedTopLength, setSelectedTopLength] = useState<TopLengthOption | null>(initialSession?.selectedTopLength ?? null);
  const [selectedDressLength, setSelectedDressLength] = useState<DressLengthOption | null>(null);
  const [selectedOuterwearLength, setSelectedOuterwearLength] = useState<OuterwearLengthOption | null>(null);
  const [selectedScene, setSelectedScene] = useState<SceneOption | null>(null);
  const [selectedLighting, setSelectedLighting] = useState<LightingOption | null>(null);
  const [sceneQualityMode, setSceneQualityMode] = useState<SceneQualityMode>('fast');
  const [sceneVariations, setSceneVariations] = useState<SceneVariation[]>(initialSession?.sceneVariations ?? []);
  const [selectedSceneVariationId, setSelectedSceneVariationId] = useState<string | null>(null);
  const [customScenePrompt, setCustomScenePrompt] = useState<string | null>(null);
  const sessionSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Restore session state on mount (SESS-01, SESS-02, SESS-03)
  useEffect(() => {
    const restoredSession = restoreSessionState();
    if (restoredSession) {
      if (restoredSession.modelImageUrl) {
        setModelImageUrl(restoredSession.modelImageUrl);
      }
      if (restoredSession.outfitHistory && restoredSession.outfitHistory.length > 0) {
        setOutfitHistory(restoredSession.outfitHistory);
      }
      setCurrentOutfitIndex(restoredSession.currentOutfitIndex);
      setCurrentPoseIndex(restoredSession.currentPoseIndex);
      if (restoredSession.sceneVariations && restoredSession.sceneVariations.length > 0) {
        setSceneVariations(restoredSession.sceneVariations);
      }
      if (restoredSession.pinnedWardrobe && restoredSession.pinnedWardrobe.length > 0) {
        setWardrobe(prev => {
          const userItems = restoredSession.pinnedWardrobe || [];
          return [...defaultWardrobe, ...getPinnedWardrobeItems(), ...userItems.filter(i => i.source === 'user')];
        });
      }
      setActiveCategory(restoredSession.activeCategory);
      setSelectedTopLength(restoredSession.selectedTopLength);
    }
  }, []);

  // Persist session state on every state change (SESS-01, SESS-02, SESS-03)
  useEffect(() => {
    if (modelImageUrl && outfitHistory.length > 0) {
      const pinnedItems = wardrobe.filter((item) => item.isPinned === true);
      const sessionState: SessionState = {
        modelImageUrl,
        outfitHistory,
        currentOutfitIndex,
        currentPoseIndex,
        sceneVariations,
        pinnedWardrobe: pinnedItems,
        activeCategory,
        selectedTopLength,
      };
      saveSessionState(sessionState);
    }
  }, [modelImageUrl, outfitHistory, currentOutfitIndex, currentPoseIndex, sceneVariations, wardrobe, activeCategory, selectedTopLength]);

  useEffect(() => {
    if (sessionSaveTimerRef.current) {
      clearTimeout(sessionSaveTimerRef.current);
    }

    sessionSaveTimerRef.current = setTimeout(() => {
      const userItems = wardrobe.filter((item) => item.source === 'user').map(item => ({
        ...item,
        url: item.url.startsWith('data:image/') ? '[image-data]' : item.url,
      }));
      const smallSceneVariations = sceneVariations.map(v => ({
        ...v,
        imageUrl: '',
      }));
      const outfitLayerMeta = outfitHistory.map(layer => ({
        garmentId: layer.garment?.id ?? null,
        garmentName: layer.garment?.name ?? null,
        category: layer.category,
        topLength: layer.topLength ?? null,
        dressLength: layer.dressLength ?? null,
        outerwearLength: layer.outerwearLength ?? null,
      }));
      const data: SessionData = {
        currentOutfitIndex,
        currentPoseIndex,
        sceneVariations: smallSceneVariations,
        activeCategory,
        selectedTopLength,
        wardrobeUserItems: userItems,
        outfitLayerMeta,
        hasModel: !!modelImageUrl,
      };
      saveSession(data);
    }, 500);

    return () => {
      if (sessionSaveTimerRef.current) {
        clearTimeout(sessionSaveTimerRef.current);
      }
    };
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, sceneVariations, activeCategory, selectedTopLength, selectedDressLength, selectedOuterwearLength, wardrobe, modelImageUrl]);

  const activeOutfitLayers = useMemo(() => 
    outfitHistory.slice(0, currentOutfitIndex + 1), 
    [outfitHistory, currentOutfitIndex]
  );
  
  const activeGarmentIds = useMemo(() =>
    activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[],
    [activeOutfitLayers]
  );

  const completedCategories = useMemo(() =>
    activeOutfitLayers
      .map((layer) => layer.category)
      .filter((category): category is GarmentCategory => category !== 'base'),
    [activeOutfitLayers]
  );

  const currentSceneVariations = useMemo(() =>
    sceneVariations
      .filter((variation) => variation.outfitIndex === currentOutfitIndex)
      .sort((left, right) => right.createdAt - left.createdAt),
    [sceneVariations, currentOutfitIndex]
  );

  const selectedSceneVariation = useMemo(() =>
    currentSceneVariations.find((variation) => variation.id === selectedSceneVariationId) ?? null,
    [currentSceneVariations, selectedSceneVariationId]
  );

  const displayImageUrl = useMemo(() => {
    if (selectedSceneVariation) {
      return selectedSceneVariation.imageUrl;
    }

    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    return currentLayer.poseImages[poseInstruction] ?? Object.values(currentLayer.poseImages)[0];
  }, [selectedSceneVariation, outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const availablePoseKeys = useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  const canDownloadImage = useMemo(() => outfitHistory.length > 0 && Boolean(displayImageUrl), [outfitHistory.length, displayImageUrl]);

  const handleDownloadImage = useCallback(() => {
    void downloadImage(displayImageUrl, `fit-check-${Date.now()}.png`);
  }, [displayImageUrl]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    setOutfitHistory([{
      garment: null,
      category: 'base',
      baseSourceImageUrl: url,
      poseImages: { [POSE_INSTRUCTIONS[0]]: url }
    }]);
    setCurrentOutfitIndex(0);
    setActiveCategory('top');
    setSelectedTopLength(null);
    setSelectedScene(null);
    setSelectedLighting(null);
    setSceneVariations([]);
    setSelectedSceneVariationId(null);
  };

  const handleStartOver = () => {
    clearSession();
    clearSessionData(); // Clear new session persistence (SESS-04)
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPoseIndex(0);
    setIsMobileDrawerOpen(false);
    setWardrobe([...defaultWardrobe, ...getPinnedWardrobeItems()]);
    setActiveCategory('top');
    setSelectedTopLength(null);
    setSelectedScene(null);
    setSelectedLighting(null);
    setSceneVariations([]);
    setSelectedSceneVariationId(null);
  };

  const handleGarmentSelect = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => {
    if (!displayImageUrl || isLoading) return;
    if (activeCategory === 'top' && !selectedTopLength) {
      setError('Üst giyim için önce ürün boyu seçin.');
      return;
    }
    if (activeCategory === 'dress' && !selectedDressLength) {
      setError('Elbise için önce elbise boyu seçin.');
      return;
    }
    if (activeCategory === 'outerwear' && !selectedOuterwearLength) {
      setError('Dış giyim için önce dış giyim boyu seçin.');
      return;
    }

    // Caching: Check if we are re-applying a previously generated layer
    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
        setCurrentOutfitIndex(prev => prev + 1);
        setCurrentPoseIndex(0);
        setSelectedSceneVariationId(null);
        return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Adding ${garmentInfo.name}...`);

    try {
      const newImageUrl = await generateVirtualTryOnImage(displayImageUrl, garmentFile, activeCategory, selectedTopLength, selectedDressLength, selectedOuterwearLength);
      const currentPoseInstruction = getPoseInstructionByIndex(currentPoseIndex);

      const newLayer: OutfitLayer = {
        garment: { ...garmentInfo, category: activeCategory },
        poseImages: { [currentPoseInstruction]: newImageUrl },
        category: activeCategory,
        topLength: activeCategory === 'top' ? selectedTopLength : null,
        dressLength: activeCategory === 'dress' ? selectedDressLength : null,
        outerwearLength: activeCategory === 'outerwear' ? selectedOuterwearLength : null,
      };

      setOutfitHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...newHistory, newLayer];
      });
      setCurrentOutfitIndex(prev => prev + 1);
      setCurrentPoseIndex(0);
      setSelectedSceneVariationId(null);
      setActiveCategory(getNextCategory(activeCategory));
      if (activeCategory === 'top') {
        setSelectedTopLength(null);
      }
      if (activeCategory === 'dress') {
        setSelectedDressLength(null);
      }
      if (activeCategory === 'outerwear') {
        setSelectedOuterwearLength(null);
      }

      // Add to personal wardrobe if it's not already there
      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) {
            return prev;
        }
        return [...prev, garmentInfo];
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to apply garment'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [displayImageUrl, isLoading, currentPoseIndex, outfitHistory, currentOutfitIndex, activeCategory, selectedTopLength, selectedDressLength, selectedOuterwearLength]);

  const canUndo = currentOutfitIndex > 0;
  const canRedo = currentOutfitIndex < outfitHistory.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const previousLayer = activeOutfitLayers[activeOutfitLayers.length - 1];
    setCurrentOutfitIndex(prevIndex => prevIndex - 1);
    setCurrentPoseIndex(0);
    setSelectedSceneVariationId(null);
    if (previousLayer?.category && previousLayer.category !== 'base') {
      setActiveCategory(previousLayer.category);
      if (previousLayer.category === 'top') {
        setSelectedTopLength(previousLayer.topLength ?? null);
      }
    }
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    setCurrentOutfitIndex(prev => prev + 1);
    setCurrentPoseIndex(0);
    setSelectedSceneVariationId(null);
    if (nextLayer?.category && nextLayer.category !== 'base') {
      setActiveCategory(nextLayer.category);
      if (nextLayer.category === 'top') {
        setSelectedTopLength(nextLayer.topLength ?? null);
      }
    } else {
      const currentLayer = outfitHistory[currentOutfitIndex];
      setActiveCategory(getNextCategory(currentLayer?.category === 'base' ? 'top' : currentLayer?.category ?? 'top'));
    }
  };

  const handleRegenerate = useCallback(async () => {
    if (isLoading || outfitHistory.length === 0 || currentOutfitIndex === 0) return;

    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer.garment) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage('Regenerating...');

    try {
      const poseInstruction = getPoseInstructionByIndex(currentPoseIndex);
      
      // Get the base image for regeneration
      const baseImageForRegenerate = currentLayer.poseSourceImageUrl ?? displayImageUrl;
      if (!baseImageForRegenerate) return;
      
      // Regenerate the pose/image
      const newImageUrl = await generatePoseVariation(baseImageForRegenerate, poseInstruction);
      
      // Update the outfit history with the new image
      setOutfitHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const updatedLayer = newHistory[currentOutfitIndex];
        updatedLayer.poseImages[poseInstruction] = newImageUrl;
        return newHistory;
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to regenerate image'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [isLoading, outfitHistory, currentOutfitIndex, currentPoseIndex, displayImageUrl]);

  const handlePinWardrobeItem = useCallback(async (item: WardrobeItem) => {
    if (item.source !== 'user' || item.isPinned) {
      return;
    }

    const persistentUrl = item.url.startsWith('data:image/') ? item.url : await blobUrlToDataUrl(item.url);
    const pinnedItem = { ...item, url: persistentUrl, isPinned: true };
    addPinnedWardrobeItem(pinnedItem);
    setWardrobe((prev) => prev.map((entry) => (entry.id === item.id ? pinnedItem : entry)));
  }, []);

  const handlePoseSelect = useCallback(async (newIndex: number) => {
    if (isLoading || outfitHistory.length === 0 || newIndex === currentPoseIndex) return;

    const poseInstruction = getPoseInstructionByIndex(newIndex);
    const currentLayer = outfitHistory[currentOutfitIndex];

    // If no scene is selected and pose already exists, just update the index to show it.
    if (!selectedSceneVariation && currentLayer.poseImages[poseInstruction]) {
      setCurrentPoseIndex(newIndex);
      return;
    }

    const frozenPoseSourceImageUrl = !selectedSceneVariation && !currentLayer.poseSourceImageUrl
      ? displayImageUrl
      : currentLayer.poseSourceImageUrl;

    const baseImageForPoseChange = selectedSceneVariation
      ? getPoseGenerationBaseImage(selectedSceneVariation, currentLayer)
      : frozenPoseSourceImageUrl ?? getPoseGenerationBaseImage(null, currentLayer);
    if (!baseImageForPoseChange) return; // Should not happen

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Changing pose...`);

    const prevPoseIndex = currentPoseIndex;
    // Optimistically update the pose index so the pose name changes in the UI
    setCurrentPoseIndex(newIndex);

    try {
      const newImageUrl = await generatePoseVariation(baseImageForPoseChange, poseInstruction);
      setOutfitHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const updatedLayer = newHistory[currentOutfitIndex];
        if (!selectedSceneVariation && frozenPoseSourceImageUrl && !updatedLayer.poseSourceImageUrl) {
          updatedLayer.poseSourceImageUrl = frozenPoseSourceImageUrl;
        }
        updatedLayer.poseImages[poseInstruction] = newImageUrl;
        return newHistory;
      });

      if (selectedSceneVariation) {
        const posedSceneVariation: SceneVariation = {
          ...selectedSceneVariation,
          id: `scene-pose-${Date.now()}`,
          imageUrl: newImageUrl,
          sourcePose: poseInstruction,
          createdAt: Date.now(),
        };

        setSceneVariations((previous) => addSceneVariationWithLimit(previous, posedSceneVariation, 3));
        setSelectedSceneVariationId(posedSceneVariation.id);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to change pose'));
      // Revert pose index on failure
      setCurrentPoseIndex(prevPoseIndex);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex, selectedSceneVariation]);

  const handleCategorySelect = useCallback((nextCategory: GarmentCategory) => {
    setError(null);
    setActiveCategory(nextCategory);
  }, []);

  const handleSelectCustomScene = useCallback((customPrompt: string) => {
    setError(null);
    setSelectedScene('studio'); // Set scene to a default value
    setCustomScenePrompt(customPrompt);
  }, []);

  const handleGenerateScene = useCallback(async () => {
    const currentLayer = outfitHistory[currentOutfitIndex];
    const sceneBaseImageUrl = getSceneGenerationBaseImage(currentLayer, getPoseInstructionByIndex(currentPoseIndex));
    if (!sceneBaseImageUrl || !selectedLighting || isLoading) return;

    // Either use custom scene or selected preset scene
    if (!customScenePrompt && !selectedScene) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage('Generating scene variation...');

    try {
      const imageUrl = await generateSceneVariation(
        sceneBaseImageUrl, 
        selectedScene || 'studio', 
        selectedLighting, 
        sceneQualityMode,
        customScenePrompt ?? undefined
      );
      const newVariation: SceneVariation = {
        id: `scene-${Date.now()}`,
        outfitIndex: currentOutfitIndex,
        scene: selectedScene || 'studio',
        lighting: selectedLighting,
        imageUrl,
        sourcePose: getPoseInstructionByIndex(currentPoseIndex),
        createdAt: Date.now(),
        qualityMode: sceneQualityMode,
        customPrompt: customScenePrompt ?? undefined,
      };

      setSceneVariations((previous) => addSceneVariationWithLimit(previous, newVariation, 3));
      setSelectedSceneVariationId(newVariation.id);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to create scene variation'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, selectedScene, selectedLighting, customScenePrompt, isLoading, sceneQualityMode]);

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {!modelImageUrl ? (
          <motion.div
            key="start-screen"
            className="w-screen min-h-screen flex items-start sm:items-center justify-center bg-gray-50 p-4 pb-20"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <StartScreen onModelFinalized={handleModelFinalized} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            className="relative flex flex-col h-screen bg-white overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden">
              <div className="w-full h-full flex-grow flex items-center justify-center bg-white pb-16 relative">
                <Canvas
                  displayImageUrl={displayImageUrl}
                  onStartOver={handleStartOver}
                  onDownload={handleDownloadImage}
                  canDownload={canDownloadImage}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  onSelectPose={handlePoseSelect}
                  poseInstructions={POSE_LABELS}
                  currentPoseIndex={currentPoseIndex}
                  availablePoseKeys={availablePoseKeys}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onRegenerate={handleRegenerate}
                />

                {modelImageUrl && !isMobileDrawerOpen && (
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="absolute top-4 right-4 md:hidden z-30 inline-flex items-center gap-2 rounded-full border border-gray-300/70 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur-md transition-all hover:bg-white active:scale-95"
                    aria-label="Ayarlar panelini aç"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Panel</span>
                  </button>
                )}
              </div>

              {isMobile && isMobileDrawerOpen && (
                <button
                  type="button"
                  className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] md:hidden"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Paneli kapat"
                />
              )}

              <aside
                className={`fixed top-0 right-0 z-50 h-full w-[88vw] max-w-sm bg-white/95 backdrop-blur-xl flex flex-col border-l border-gray-200/70 shadow-2xl transition-transform duration-500 ease-in-out ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'} md:absolute md:relative md:z-auto md:h-full md:w-full md:max-w-sm md:translate-x-0 md:flex-shrink-0 md:border-l md:border-gray-200/60 md:bg-white/80 md:shadow-none`}
                style={{ transitionProperty: 'transform' }}
              >
                  <div className="md:hidden flex items-center justify-between border-b border-gray-200/70 px-4 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Ayarlar</p>
                      <p className="mt-1 text-sm text-gray-700">Yüklemeler ve kombin adımları</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                      aria-label="Paneli kapat"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4 md:p-6 pb-20 overflow-y-auto flex-grow flex flex-col gap-8">
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                      </div>
                    )}
                    <OutfitStack
                      outfitHistory={activeOutfitLayers}
                      onRemoveLastGarment={handleUndo}
                    />
                    <CategoryStepPanel
                      activeCategory={activeCategory}
                      completedCategories={completedCategories}
                      selectedTopLength={selectedTopLength}
                      selectedDressLength={selectedDressLength}
                      selectedOuterwearLength={selectedOuterwearLength}
                      onSelectCategory={handleCategorySelect}
                      onSelectTopLength={(length) => {
                        setSelectedTopLength(length);
                        setError(null);
                      }}
                      onSelectDressLength={(length) => {
                        setSelectedDressLength(length);
                        setError(null);
                      }}
                      onSelectOuterwearLength={(length) => {
                        setSelectedOuterwearLength(length);
                        setError(null);
                      }}
                      isLoading={isLoading}
                    />
                    <ScenePanel
                      selectedScene={selectedScene}
                      selectedLighting={selectedLighting}
                      qualityMode={sceneQualityMode}
                      onSelectScene={setSelectedScene}
                      onSelectLighting={setSelectedLighting}
                      onChangeQualityMode={setSceneQualityMode}
                      onSelectCustomScene={handleSelectCustomScene}
                      onGenerate={handleGenerateScene}
                      isLoading={isLoading}
                      disabled={!displayImageUrl}
                      hasCustomScene={customScenePrompt !== null}
                    />
                    <SceneVariationList
                      variations={currentSceneVariations}
                      selectedVariationId={selectedSceneVariationId}
                      onSelectVariation={setSelectedSceneVariationId}
                      isLoading={isLoading}
                    />
                    <WardrobePanel
                      onGarmentSelect={handleGarmentSelect}
                      onPinItem={handlePinWardrobeItem}
                      activeGarmentIds={activeGarmentIds}
                      isLoading={isLoading}
                      wardrobe={wardrobe}
                      activeCategory={activeCategory}
                    />
                  </div>
              </aside>
            </main>
            <AnimatePresence>
              {isLoading && isMobile && (
                <motion.div
                  className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
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
          </motion.div>
        )}
      </AnimatePresence>
      <Footer isOnDressingScreen={!!modelImageUrl} />
    </div>
  );
};

export default App;