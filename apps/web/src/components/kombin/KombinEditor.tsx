"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from '@/components/kombin/StartScreen';
import Canvas from '@/components/kombin/Canvas';
import UndoRedoBar from '@/components/kombin/UndoRedoBar';
import WardrobePanel from '@/components/kombin/WardrobeModal';
import OutfitStack from '@/components/kombin/OutfitStack';
import CategoryStepPanel from '@/components/kombin/CategoryStepPanel';
import ScenePanel from '@/components/kombin/ScenePanel';
import SceneVariationList from '@/components/kombin/SceneVariationList';
import { generateIdentityReferenceImage, generateModelSwapImage, generateSceneVariation, generateVirtualTryOnImage, generatePoseVariation } from '@/lib/kombin/services/geminiService';
import { generateExperimentalOutfitImage, generateGptExperimentalOutfitImage, generateGptSceneVariation } from '@/lib/kombin/services/falService';
import { ExperimentalGarmentSelection, GarmentCategory, DressLengthOption, OuterwearLengthOption, LightingOption, OutfitLayer, SceneOption, SceneProvider, SceneQualityMode, SceneVariation, StylingMode, TopLengthOption, WardrobeItem } from '@/lib/kombin/types';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/kombin/icons';
import { defaultWardrobe } from '@/lib/kombin/wardrobe';
import Footer from '@/components/kombin/Footer';
import { getFriendlyErrorMessage } from '@/lib/kombin/utils';
import { CATEGORY_LABELS, getNextCategory, isCategorySelectionAllowed } from '@/lib/kombin/outfitFlow';
import { addSceneVariationWithLimit, getPoseGenerationBaseImage, getSceneGenerationBaseImage } from '@/lib/kombin/sceneVariations';
import { getModelSwapReferenceImage } from '@/lib/kombin/modelSwap';
import { downloadImage } from '@/lib/kombin/downloadImage';
import { blobUrlToDataUrl } from '@/lib/kombin/imagePersistence';
import { POSE_OPTIONS } from '@/lib/kombin/poseOptions';
import { addPinnedWardrobeItem, getPinnedWardrobeItems } from '@/lib/kombin/pinnedWardrobe';
import { saveSession, loadSession, clearSession } from '@/lib/kombin/sessionStorage';
import { sanitizePersistedWardrobeItems } from '@/lib/kombin/wardrobePersistence';
import type { SessionData } from '@/lib/kombin/sessionStorage';
import { saveSessionState, restoreSessionState, clearSessionData } from '@/lib/sessionPersistence';
import type { SessionState } from '@/lib/sessionPersistence';
import Spinner from '@/components/kombin/Spinner';
import ModelSwapPanel from '@/components/kombin/ModelSwapPanel';

type WorkspaceMode = 'styling' | 'modelSwap';

const POSE_INSTRUCTIONS = POSE_OPTIONS.map((pose) => pose.instruction);
const POSE_LABELS = POSE_OPTIONS.map((pose) => pose.label);
const EXPERIMENTAL_LOADING_MESSAGE = 'Deneysel kombin hazırlanıyor...';
const EXPERIMENTAL_STATUS_UPDATE_DELAY_MS = 80;

const getPoseInstructionByIndex = (index: number) => POSE_INSTRUCTIONS[index];
const getPoseLabelByIndex = (index: number) => POSE_LABELS[index];

const useMediaQuery = (query: string): boolean => {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

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
type ExperimentalSelectionMap = Partial<Record<GarmentCategory, ExperimentalGarmentSelection>>;

const EXPERIMENTAL_DETAIL_PLACEHOLDERS: Record<GarmentCategory, string> = {
  top: 'Omuz çizgisini keskin tut, belde hafif otursun',
  outerwear: 'Truvakar kol gibi uygula',
  dress: 'Etek ucunda hafif hareket ve temiz düşüş olsun',
  bottom: 'Paçalarında birer cm yırtmaç olsun',
  footwear: 'Burun formunu ve taban yüksekliğini koru',
  accessory: 'Aksesuarı doğal ölçekte, tek parça olarak ekle',
};

const mergeWardrobeItems = (...groups: WardrobeItem[][]) => {
  const itemsById = new Map<string, WardrobeItem>();

  for (const group of groups) {
    for (const item of group) {
      itemsById.set(item.id, item);
    }
  }

  return Array.from(itemsById.values());
};

const KombinEditor: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(initialSession?.currentOutfitIndex ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(initialSession?.currentPoseIndex ?? 0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    const userItems = sanitizePersistedWardrobeItems(initialSession?.wardrobeUserItems ?? []);
    return mergeWardrobeItems(defaultWardrobe, getPinnedWardrobeItems(), userItems.filter(i => i.source === 'user'));
  });
  const [activeCategory, setActiveCategory] = useState<GarmentCategory>(initialSession?.activeCategory ?? 'top');
  const [selectedTopLength, setSelectedTopLength] = useState<TopLengthOption | null>(initialSession?.selectedTopLength ?? null);
  const [selectedDressLength, setSelectedDressLength] = useState<DressLengthOption | null>(initialSession?.selectedDressLength ?? null);
  const [selectedOuterwearLength, setSelectedOuterwearLength] = useState<OuterwearLengthOption | null>(initialSession?.selectedOuterwearLength ?? null);
  const [selectedScene, setSelectedScene] = useState<SceneOption | null>(null);
  const [selectedLighting, setSelectedLighting] = useState<LightingOption | null>(null);
  const [sceneQualityMode, setSceneQualityMode] = useState<SceneQualityMode>('fast');
  const [sceneProvider, setSceneProvider] = useState<SceneProvider>('gemini');
  const [sceneVariations, setSceneVariations] = useState<SceneVariation[]>(initialSession?.sceneVariations ?? []);
  const [selectedSceneVariationId, setSelectedSceneVariationId] = useState<string | null>(null);
  const [customScenePrompt, setCustomScenePrompt] = useState<string | null>(null);
  const [stylingMode, setStylingMode] = useState<StylingMode>('standard');
  const [isExperimentalPanelOpen, setIsExperimentalPanelOpen] = useState(true);
  const [stagedExperimentalSelections, setStagedExperimentalSelections] = useState<ExperimentalSelectionMap>({});
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('styling');
  const [pendingModelSwapFile, setPendingModelSwapFile] = useState<File | null>(null);
  const [pendingModelSwapPreviewUrl, setPendingModelSwapPreviewUrl] = useState<string | null>(null);
  const sessionSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const experimentalStatusTimerRef = useRef<number | null>(null);
  const experimentalPendingStatusRef = useRef('');
  const experimentalLastStatusRef = useRef('');
  const isMobile = useMediaQuery('(max-width: 767px)');

  const clearExperimentalStatusTimer = useCallback(() => {
    if (experimentalStatusTimerRef.current) {
      window.clearTimeout(experimentalStatusTimerRef.current);
      experimentalStatusTimerRef.current = null;
    }

    experimentalPendingStatusRef.current = '';
  }, []);

  const resetExperimentalLoadingStatus = useCallback(() => {
    clearExperimentalStatusTimer();
    experimentalLastStatusRef.current = '';
    setLoadingMessage('');
  }, [clearExperimentalStatusTimer]);

  const scheduleExperimentalLoadingStatus = useCallback((message: string) => {
    const nextMessage = message.trim() || EXPERIMENTAL_LOADING_MESSAGE;

    if (nextMessage === experimentalLastStatusRef.current) {
      return;
    }

    experimentalPendingStatusRef.current = nextMessage;

    if (experimentalStatusTimerRef.current) {
      return;
    }

    experimentalStatusTimerRef.current = window.setTimeout(() => {
      experimentalStatusTimerRef.current = null;
      const pendingMessage = experimentalPendingStatusRef.current;
      experimentalPendingStatusRef.current = '';

      if (!pendingMessage || pendingMessage === experimentalLastStatusRef.current) {
        return;
      }

      experimentalLastStatusRef.current = pendingMessage;
      setLoadingMessage(pendingMessage);
    }, EXPERIMENTAL_STATUS_UPDATE_DELAY_MS);
  }, []);

  useEffect(() => clearExperimentalStatusTimer, [clearExperimentalStatusTimer]);

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
          const restoredPinnedItems = sanitizePersistedWardrobeItems(restoredSession.pinnedWardrobe || []);
          const existingUserItems = prev.filter((item) => item.source === 'user');
          return mergeWardrobeItems(defaultWardrobe, getPinnedWardrobeItems(), existingUserItems, restoredPinnedItems.filter(i => i.source === 'user'));
        });
      }
      setActiveCategory(restoredSession.activeCategory);
      setSelectedTopLength(restoredSession.selectedTopLength);
      setSelectedDressLength(restoredSession.selectedDressLength);
      setSelectedOuterwearLength(restoredSession.selectedOuterwearLength);
      setStylingMode(restoredSession.stylingMode);
      setStagedExperimentalSelections(
        Object.fromEntries(
          (restoredSession.stagedExperimentalGarments ?? []).map((selection) => [selection.category, selection]),
        ) as ExperimentalSelectionMap,
      );
    }
  }, []);

  // Persist session state on every state change (SESS-01, SESS-02, SESS-03)
  useEffect(() => {
    if (modelImageUrl && outfitHistory.length > 0) {
      const pinnedItems = wardrobe.filter((item) => item.isPinned === true);
      const persistableStagedExperimentalGarments = Object.values(stagedExperimentalSelections).filter(
        (selection): selection is ExperimentalGarmentSelection & { source: string } =>
          Boolean(selection) && typeof selection.source === 'string',
      );
      const sessionState: SessionState = {
        modelImageUrl,
        outfitHistory,
        currentOutfitIndex,
        currentPoseIndex,
        sceneVariations,
        pinnedWardrobe: pinnedItems,
        activeCategory,
        selectedTopLength,
        selectedDressLength,
        selectedOuterwearLength,
        stylingMode,
        stagedExperimentalGarments: persistableStagedExperimentalGarments,
      };
      saveSessionState(sessionState);
    }
  }, [
    modelImageUrl,
    outfitHistory,
    currentOutfitIndex,
    currentPoseIndex,
    sceneVariations,
    wardrobe,
    activeCategory,
    selectedTopLength,
    selectedDressLength,
    selectedOuterwearLength,
    stylingMode,
    stagedExperimentalSelections,
  ]);

  useEffect(() => {
    if (sessionSaveTimerRef.current) {
      clearTimeout(sessionSaveTimerRef.current);
    }

    sessionSaveTimerRef.current = setTimeout(() => {
      const userItems = sanitizePersistedWardrobeItems(wardrobe.filter((item) => item.source === 'user')).map(item => ({
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
        selectedDressLength,
        selectedOuterwearLength,
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

  const stagedExperimentalGarments = useMemo(
    () => Object.values(stagedExperimentalSelections).filter(Boolean) as ExperimentalGarmentSelection[],
    [stagedExperimentalSelections],
  );
  
  const activeGarmentIds = useMemo(() =>
    stylingMode === 'experimental'
      ? stagedExperimentalGarments.map((selection) => selection.id)
      : activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[],
    [activeOutfitLayers, stagedExperimentalGarments, stylingMode]
  );

  const completedCategories = useMemo(() =>
    activeOutfitLayers
      .flatMap((layer) => layer.completedCategories ?? [layer.category])
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

  const initializeStylingSession = (
    url: string,
    nextMode: StylingMode,
    target: WorkspaceMode = 'styling'
  ) => {
    setModelImageUrl(url);
    setWorkspaceMode(target);
    setOutfitHistory([{
      garment: null,
      category: 'base',
      baseSourceImageUrl: url,
      poseImages: { [POSE_INSTRUCTIONS[0]]: url }
    }]);
    setCurrentOutfitIndex(0);
    setActiveCategory('top');
    setSelectedTopLength(null);
    setSelectedDressLength(null);
    setSelectedOuterwearLength(null);
    setSelectedScene(null);
    setSelectedLighting(null);
    setSceneVariations([]);
    setSelectedSceneVariationId(null);
    setStylingMode(nextMode);
    setStagedExperimentalSelections({});
    setError(null);
    setLoadingMessage('');
    if (pendingModelSwapPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingModelSwapPreviewUrl);
    }
    setPendingModelSwapFile(null);
    setPendingModelSwapPreviewUrl(null);
  };

  const handleModelFinalized = (url: string, target: WorkspaceMode = 'styling') => {
    initializeStylingSession(url, 'standard', target);
  };

  const handleExperimentalStyling = (url: string) => {
    initializeStylingSession(url, 'experimental', 'styling');
  };

  const handleStartOver = () => {
    if (pendingModelSwapPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingModelSwapPreviewUrl);
    }
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
    setWardrobe(mergeWardrobeItems(defaultWardrobe, getPinnedWardrobeItems()));
    setActiveCategory('top');
    setSelectedTopLength(null);
    setSelectedDressLength(null);
    setSelectedOuterwearLength(null);
    setSelectedScene(null);
    setSelectedLighting(null);
    setSceneVariations([]);
    setSelectedSceneVariationId(null);
    setStylingMode('standard');
    setStagedExperimentalSelections({});
    setWorkspaceMode('styling');
    setPendingModelSwapFile(null);
    setPendingModelSwapPreviewUrl(null);
  };

  const handleStageGarment = useCallback((selection: ExperimentalGarmentSelection) => {
    setError(null);
    setStagedExperimentalSelections((previous) => ({
      ...previous,
      [selection.category]: selection,
    }));
  }, []);

  const handleRemoveStagedGarment = useCallback((category: GarmentCategory) => {
    setError(null);
    setStagedExperimentalSelections((previous) => {
      const nextSelections = { ...previous };
      delete nextSelections[category];
      return nextSelections;
    });
  }, []);

  const handleExperimentalDetailChange = useCallback((category: GarmentCategory, detailInstruction: string) => {
    setError(null);
    setStagedExperimentalSelections((previous) => {
      const selection = previous[category];

      if (!selection) {
        return previous;
      }

      return {
        ...previous,
        [category]: {
          ...selection,
          detailInstruction,
        },
      };
    });
  }, []);

  const handleSelectModelSwapFile = useCallback((file: File) => {
    if (pendingModelSwapPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingModelSwapPreviewUrl);
    }
    setPendingModelSwapFile(file);
    setPendingModelSwapPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }, [pendingModelSwapPreviewUrl]);

  const handleApplyModelSwap = useCallback(async () => {
    if (!pendingModelSwapFile || isLoading) return;

    const currentLayer = outfitHistory[currentOutfitIndex];
    const referenceLookImageUrl = getModelSwapReferenceImage(currentLayer) ?? modelImageUrl;
    if (!referenceLookImageUrl) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage('Yeni manken referansi hazirlaniyor...');

    try {
      const identityReferenceImageUrl = await generateIdentityReferenceImage(pendingModelSwapFile);
      setLoadingMessage('Yeni manken kombine uygulanıyor...');
      const swappedImageUrl = await generateModelSwapImage(referenceLookImageUrl, identityReferenceImageUrl);

      console.info('Model swap completed', {
        referenceLookLength: referenceLookImageUrl.length,
        identityReferenceLength: identityReferenceImageUrl.length,
        swappedImageLength: swappedImageUrl.length,
        identicalToReference: swappedImageUrl === referenceLookImageUrl,
      });

      setModelImageUrl(swappedImageUrl);
      setOutfitHistory([{
        garment: null,
        category: 'base',
        baseSourceImageUrl: swappedImageUrl,
        poseImages: { [POSE_INSTRUCTIONS[0]]: swappedImageUrl },
      }]);
      setCurrentOutfitIndex(0);
      setCurrentPoseIndex(0);
      setSelectedScene(null);
      setSelectedLighting(null);
      setSceneVariations([]);
      setSelectedSceneVariationId(null);
      if (pendingModelSwapPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(pendingModelSwapPreviewUrl);
      }
      setPendingModelSwapFile(null);
      setPendingModelSwapPreviewUrl(null);
      setWorkspaceMode('styling');
      setActiveCategory('top');
      setSelectedTopLength(null);
      setSelectedDressLength(null);
      setSelectedOuterwearLength(null);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Yeni manken uygulanamadı'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [pendingModelSwapFile, isLoading, outfitHistory, currentOutfitIndex, modelImageUrl]);
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
    const reusesSameSelection =
      nextLayer &&
      nextLayer.garment?.id === garmentInfo.id &&
      nextLayer.category === activeCategory &&
      (activeCategory !== 'top' || nextLayer.topLength === selectedTopLength) &&
      (activeCategory !== 'dress' || nextLayer.dressLength === selectedDressLength) &&
      (activeCategory !== 'outerwear' || nextLayer.outerwearLength === selectedOuterwearLength);

    if (reusesSameSelection) {
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
        return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Adding ${garmentInfo.name}...`);

    try {
      const newImageUrl = await generateVirtualTryOnImage(
        displayImageUrl,
        garmentFile,
        activeCategory,
        activeCategory === 'top' ? selectedTopLength : null,
        activeCategory === 'dress' ? selectedDressLength : null,
        activeCategory === 'outerwear' ? selectedOuterwearLength : null,
      );
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
        setSelectedDressLength(null);
        setSelectedOuterwearLength(null);
      }
      if (previousLayer.category === 'dress') {
        setSelectedDressLength(previousLayer.dressLength ?? null);
        setSelectedTopLength(null);
        setSelectedOuterwearLength(null);
      }
      if (previousLayer.category === 'outerwear') {
        setSelectedOuterwearLength(previousLayer.outerwearLength ?? null);
        setSelectedTopLength(null);
        setSelectedDressLength(null);
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
      setActiveCategory(getNextCategory(nextLayer.category));
      setSelectedTopLength(null);
      setSelectedDressLength(null);
      setSelectedOuterwearLength(null);
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

  const handleExperimentalGenerate = useCallback(async (generator = generateExperimentalOutfitImage) => {
    if (!displayImageUrl || isLoading || stagedExperimentalGarments.length === 0) {
      return;
    }

    setError(null);
    setIsLoading(true);
    clearExperimentalStatusTimer();
    experimentalLastStatusRef.current = EXPERIMENTAL_LOADING_MESSAGE;
    setLoadingMessage(EXPERIMENTAL_LOADING_MESSAGE);

    try {
      const finalSceneDescription = [customScenePrompt ?? selectedScene, selectedLighting].filter(Boolean).join(' | ') || undefined;

      const generatedImageUrl = await generator({
        baseModelImage: displayImageUrl,
        garmentSelections: stagedExperimentalGarments,
        finalSceneDescription,
        onStatusUpdate: (message) => scheduleExperimentalLoadingStatus(message),
      });

      const lastSelection = stagedExperimentalGarments[stagedExperimentalGarments.length - 1];
      const poseInstruction = getPoseInstructionByIndex(0);
      const layerName = stagedExperimentalGarments.map((selection) => selection.name).join(', ');
      const completedBundleCategories = Array.from(new Set(stagedExperimentalGarments.map((selection) => selection.category)));

      const bundleLayer: OutfitLayer = {
        garment: {
          id: `experimental-bundle-${Date.now()}`,
          name: `Experimental bundle: ${layerName}`,
          url: generatedImageUrl,
          category: lastSelection.category,
          source: 'user',
        },
        poseImages: { [poseInstruction]: generatedImageUrl },
        category: lastSelection.category,
        completedCategories: completedBundleCategories,
      };

      setOutfitHistory((prevHistory) => {
        const nextHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...nextHistory, bundleLayer];
      });
      setCurrentOutfitIndex((prev) => prev + 1);
      setCurrentPoseIndex(0);
      setSelectedSceneVariationId(null);
      setActiveCategory(getNextCategory(completedBundleCategories[completedBundleCategories.length - 1] ?? lastSelection.category));
      setStylingMode('experimental');
    } catch (err) {
      console.error(err);
      setError('Deneysel kombin üretilemedi.');
    } finally {
      setIsLoading(false);
      resetExperimentalLoadingStatus();
    }
  }, [clearExperimentalStatusTimer, currentOutfitIndex, isLoading, displayImageUrl, stagedExperimentalGarments, selectedScene, selectedLighting, customScenePrompt, scheduleExperimentalLoadingStatus, resetExperimentalLoadingStatus]);

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
    if (
      !isCategorySelectionAllowed(
        activeCategory,
        nextCategory,
        selectedTopLength,
        selectedDressLength,
        selectedOuterwearLength,
        completedCategories,
      )
    ) {
      return;
    }

    setError(null);
    setActiveCategory(nextCategory);
  }, [activeCategory, completedCategories, selectedTopLength, selectedDressLength, selectedOuterwearLength]);

  const handleSelectCustomScene = useCallback((customPrompt: string) => {
    setError(null);
    setSelectedScene(null);
    setCustomScenePrompt(customPrompt);
  }, []);

  const handleSelectScene = useCallback((scene: SceneOption) => {
    setError(null);
    setSelectedScene(scene);
    setCustomScenePrompt(null);
  }, []);

  const handleGenerateScene = useCallback(async () => {
    const currentLayer = outfitHistory[currentOutfitIndex];
    const sceneBaseImageUrl = getSceneGenerationBaseImage(currentLayer, getPoseInstructionByIndex(currentPoseIndex));
    if (!sceneBaseImageUrl || !selectedLighting || isLoading) return;

    // Either use custom scene or selected preset scene
    if (!customScenePrompt && !selectedScene) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage(sceneProvider === 'gpt-image-2' ? 'Generating GPT scene variation...' : 'Generating scene variation...');

    try {
      const generateSceneImage = sceneProvider === 'gpt-image-2' ? generateGptSceneVariation : generateSceneVariation;
      const imageUrl = await generateSceneImage(
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
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, selectedScene, selectedLighting, customScenePrompt, isLoading, sceneQualityMode, sceneProvider]);

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="kombin-app-root font-sans">
      <AnimatePresence mode="wait">
        {!modelImageUrl ? (
          <motion.div
            key="start-screen"
            className="kombin-start-shell"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <StartScreen onModelFinalized={handleModelFinalized} onExperimentalStyling={handleExperimentalStyling} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            className="kombin-app-shell relative flex flex-col h-screen overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="kombin-app-main flex-grow relative flex flex-col md:flex-row overflow-hidden">
              <div className="kombin-canvas-stage w-full h-full flex-grow flex flex-col items-center justify-center pb-16 relative">
                <div className="fixed inset-x-4 bottom-4 z-30 md:hidden">
                  <UndoRedoBar
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onStartOver={handleStartOver}
                  />
                </div>
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
                    className="kombin-panel-trigger absolute top-4 right-4 md:hidden z-30 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95"
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
                className={`kombin-side-panel fixed top-0 right-0 z-50 h-full w-[88vw] max-w-sm backdrop-blur-xl flex flex-col shadow-2xl transition-transform duration-500 ease-in-out ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'} md:absolute md:relative md:z-auto md:h-full md:w-full md:max-w-sm md:translate-x-0 md:flex-shrink-0 md:shadow-none`}
                style={{ transitionProperty: 'transform' }}
              >
                  <div className="md:hidden flex items-center justify-between border-b border-gray-200/70 px-4 py-4">
                    <div>
                       <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{workspaceMode === 'modelSwap' ? 'Manken Değiştir' : 'Ayarlar'}</p>
                       <p className="mt-1 text-sm text-gray-700">{workspaceMode === 'modelSwap' ? 'Yeni manken yükleyip kombini koru' : 'Yüklemeler ve kombin adımları'}</p>
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
                    {workspaceMode === 'modelSwap' && (
                      <ModelSwapPanel
                        currentModelImageUrl={modelImageUrl}
                        pendingModelImageUrl={pendingModelSwapPreviewUrl}
                        onSelectFile={handleSelectModelSwapFile}
                        onApply={handleApplyModelSwap}
                        isLoading={isLoading}
                      />
                    )}
                    <OutfitStack
                      outfitHistory={activeOutfitLayers}
                      onRemoveLastGarment={handleUndo}
                    />
                      {stylingMode === 'experimental' && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Deneysel mod</p>
                              <p className="mt-2 font-semibold">{stagedExperimentalGarments.length > 0 ? `${stagedExperimentalGarments.length} parça hazır` : 'Henüz parça seçilmedi'}</p>
                              {isExperimentalPanelOpen && (
                                <p className="mt-1 text-emerald-800">Parçaları sahnele, sonra tek seferde fal.ai isteği gönder.</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsExperimentalPanelOpen((isOpen) => !isOpen)}
                                className="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-white"
                              >
                                {isExperimentalPanelOpen ? 'Deneysel modu kapat' : 'Deneysel modu aç'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setStylingMode('standard')}
                                className="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-white"
                              >
                                Standart moda dön
                              </button>
                            </div>
                          </div>

                          {isExperimentalPanelOpen && stagedExperimentalGarments.length > 0 && (
                            <ul className="mt-3 space-y-3 text-black">
                              {stagedExperimentalGarments.map((selection) => (
                                 <li key={selection.category} className="rounded-[8px] border border-black bg-white px-3 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="font-medium tracking-[-0.14px]">{selection.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[11px] uppercase tracking-[0.54px] text-black/60">{selection.category}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStagedGarment(selection.category)}
                                        className="rounded-full border border-black bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white focus:outline focus:outline-2 focus:outline-dashed focus:outline-black disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={`${selection.name} ürününü sil`}
                                        disabled={isLoading}
                                      >
                                        Sil
                                      </button>
                                    </div>
                                  </div>
                                  <label className="mt-3 block" htmlFor={`experimental-detail-${selection.category}`}>
                                    <span className="font-mono text-[11px] uppercase tracking-[0.54px] text-black/60">Detay talimatı</span>
                                    <textarea
                                      id={`experimental-detail-${selection.category}`}
                                      aria-label={`${selection.name} detay talimatı`}
                                      value={selection.detailInstruction ?? ''}
                                      onChange={(event) => handleExperimentalDetailChange(selection.category, event.target.value)}
                                      placeholder={EXPERIMENTAL_DETAIL_PLACEHOLDERS[selection.category]}
                                      disabled={isLoading}
                                      rows={2}
                                      className="mt-2 w-full resize-none rounded-[8px] border border-black/20 bg-white px-3 py-2 text-sm font-light leading-5 tracking-[-0.14px] text-black placeholder:text-black/35 transition focus:border-black focus:outline focus:outline-2 focus:outline-dashed focus:outline-black disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}

                          {isExperimentalPanelOpen && <div className="mt-4 flex flex-col gap-3">
                            {isLoading && loadingMessage && (
                              <p className="rounded-xl bg-white/80 px-3 py-2 text-sm font-medium text-emerald-900">
                                {loadingMessage}
                             </p>
                           )}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <button
                                type="button"
                                onClick={() => void handleExperimentalGenerate()}
                                disabled={isLoading || stagedExperimentalGarments.length === 0}
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                              >
                                Deneysel kombini üret
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleExperimentalGenerate(generateGptExperimentalOutfitImage)}
                                disabled={isLoading || stagedExperimentalGarments.length === 0}
                                className="inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-white px-4 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                GPT ile üret
                              </button>
                            </div>
                           {error && (
                             <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                               <p>{error}</p>
                               <button
                                 type="button"
                                 onClick={() => void handleExperimentalGenerate()}
                                 className="mt-2 text-sm font-semibold text-red-700 underline"
                               >
                                 Tekrar dene
                                </button>
                              </div>
                            )}
                          </div>}
                        </div>
                      )}
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
                      sceneProvider={sceneProvider}
                      onSelectScene={handleSelectScene}
                      onSelectLighting={setSelectedLighting}
                      onChangeQualityMode={setSceneQualityMode}
                      onChangeSceneProvider={setSceneProvider}
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
                       onStageGarment={handleStageGarment}
                       onPinItem={handlePinWardrobeItem}
                       activeGarmentIds={activeGarmentIds}
                       isLoading={isLoading}
                       wardrobe={wardrobe}
                       activeCategory={activeCategory}
                       selectionMode={stylingMode}
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

export default KombinEditor;
