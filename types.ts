/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type GarmentCategory = 'top' | 'bottom' | 'footwear' | 'accessory';

export type TopLengthOption = 'crop' | 'waist' | 'hip' | 'tunic';

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
  topLength?: TopLengthOption | null;
}

export type SceneOption = 'studio' | 'cafe' | 'street' | 'luxury room';

export type LightingOption = 'soft daylight' | 'golden hour' | 'dramatic' | 'editorial';
export type SceneQualityMode = 'fast' | 'pro';

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
