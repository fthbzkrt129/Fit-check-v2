import { describe, expect, it } from 'vitest';
import { buildScenePrompt, getSceneModelName } from './geminiService';

describe('scene quality modes', () => {
  it('uses the fast image model for fast mode', () => {
    expect(getSceneModelName('fast')).toBe('gemini-2.5-flash-image');
  });

  it('uses the pro image preview model for pro mode', () => {
    expect(getSceneModelName('pro')).toBe('gemini-3.1-flash-image-preview');
  });

  it('adds stronger preservation rules in pro mode', () => {
    const prompt = buildScenePrompt('luxury room', 'golden hour', 'pro');

    expect(prompt).toContain('same model identity');
    expect(prompt).toContain('same outfit and fit');
    expect(prompt).toContain('same overall framing and composition');
    expect(prompt).toContain('Do not redesign or restyle the outfit');
  });
});
