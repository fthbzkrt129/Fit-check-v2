/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type GarmentCategory = 'top' | 'outerwear' | 'dress' | 'bottom' | 'footwear' | 'accessory';

export type TopLengthOption = 'crop' | 'waist' | 'hip' | 'tunic';

export type DressLengthOption = 'knee' | 'midi' | 'maxi' | 'floor';

export type OuterwearLengthOption = 'short' | 'medium' | 'long';

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  category?: GarmentCategory;
  source: 'system' | 'user';
  isPinned?: boolean;
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null represents the base model layer
  baseSourceImageUrl?: string;
  poseSourceImageUrl?: string;
  poseImages: Record<string, string>; // Maps pose instruction to image URL
  category: GarmentCategory | 'base';
  completedCategories?: GarmentCategory[];
  topLength?: TopLengthOption | null;
  dressLength?: DressLengthOption | null;
  outerwearLength?: OuterwearLengthOption | null;
}

export type SceneOption = 'studio' | 'cafe' | 'street' | 'luxury room';

export type LightingOption = 'soft daylight' | 'golden hour' | 'dramatic' | 'editorial';
export type SceneQualityMode = 'fast' | 'pro';
export type SceneProvider = 'gemini' | 'gpt-image-2';

export interface SceneVariation {
  id: string;
  outfitIndex: number;
  scene: SceneOption;
  lighting: LightingOption;
  imageUrl: string;
  sourcePose: string;
  createdAt: number;
  qualityMode?: SceneQualityMode;
  customPrompt?: string;
}

export type StylingMode = 'standard' | 'experimental';

export type ExperimentalImageSource = string | File | Blob;

export interface ExperimentalGarmentSelection {
  id: string;
  name: string;
  category: GarmentCategory;
  source: ExperimentalImageSource;
  detailInstruction?: string;
}

export interface ExperimentalBundleGarment extends ExperimentalGarmentSelection {
  imageIndex: number;
}

export interface ExperimentalBundleInput {
  baseModelImage: ExperimentalImageSource;
  imageInputs: ExperimentalImageSource[];
  garments: ExperimentalBundleGarment[];
  finalSceneDescription?: string;
  prompt: string;
}
