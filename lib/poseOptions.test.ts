import { describe, expect, it } from 'vitest';
import { POSE_OPTIONS } from './poseOptions';

describe('POSE_OPTIONS', () => {
  it('exposes a short label and a detailed instruction for low-angle editorial pose', () => {
    const option = POSE_OPTIONS.find((pose) => pose.label === 'Low-Angle Editorial');

    expect(option).toBeDefined();
    expect(option?.instruction).toContain('low-angle camera perspective');
    expect(option?.instruction).toContain('product clear and readable');
    expect(option?.instruction.length).toBeGreaterThan(option?.label.length ?? 0);
  });
});
