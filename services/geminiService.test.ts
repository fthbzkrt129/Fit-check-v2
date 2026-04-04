import { describe, expect, it } from 'vitest';
import { buildGarmentInstructions, buildVirtualTryOnPrompt } from './geminiService';

describe('buildGarmentInstructions', () => {
  it('keeps full-body framing stable for footwear replacements', () => {
    const instructions = buildGarmentInstructions('footwear');

    expect(instructions).toContain('Preserve the full-body framing from head to toe');
    expect(instructions).toContain('Do not crop above the ankles');
    expect(instructions).toContain('Do not change the aspect ratio or camera distance');
  });

  it('keeps full-body framing stable for bottom replacements', () => {
    const instructions = buildGarmentInstructions('bottom');

    expect(instructions).toContain('Preserve the full-body framing from head to toe');
    expect(instructions).toContain('Do not crop the model');
    expect(instructions).toContain('Do not change the aspect ratio or camera distance');
  });

  it('keeps full-body framing stable for accessory additions', () => {
    const instructions = buildGarmentInstructions('accessory');

    expect(instructions).toContain('Preserve the full-body framing from head to toe');
    expect(instructions).toContain('Do not crop the model');
    expect(instructions).toContain('Do not change the aspect ratio or camera distance');
  });

  it('builds a structured JSON prompt for bottom replacements', () => {
    const prompt = buildVirtualTryOnPrompt('bottom');

    expect(() => JSON.parse(prompt)).not.toThrow();
    expect(prompt).toContain('full lower-garment replacement, not a recolor or texture swap');
    expect(prompt).toContain('Do not preserve any original pockets, front seam lines, pleats, creases, hems, waistband shape, rise, cut, or leg width');
    expect(prompt).toContain('If the base image and garment image conflict, always follow the garment image for garment structure');
  });
});
