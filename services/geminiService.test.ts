import { describe, expect, it } from 'vitest';
import { buildGarmentInstructions } from './geminiService';

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
});
