import { describe, expect, it } from 'vitest';
import {
  ORBIT_END,
  ORBIT_START,
  bowlBobOffset,
  bowlOrbitYaw,
} from './bowlSequence';

describe('bowlOrbitYaw', () => {
  it('is zero before the orbit window', () => {
    expect(bowlOrbitYaw(0)).toBe(0);
    expect(bowlOrbitYaw(ORBIT_START - 0.01)).toBe(0);
  });

  it('is a full two turns at the end of the orbit', () => {
    expect(bowlOrbitYaw(ORBIT_END)).toBeCloseTo(Math.PI * 4, 6);
  });

  it('is monotonically non-decreasing', () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const current = bowlOrbitYaw(p);
      expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = current;
    }
  });

  it('holds the final yaw after the orbit window', () => {
    expect(bowlOrbitYaw(1)).toBeCloseTo(bowlOrbitYaw(ORBIT_END), 6);
  });

  it('produces finite values across the range', () => {
    for (let p = 0; p <= 1; p += 0.01) {
      expect(Number.isFinite(bowlOrbitYaw(p))).toBe(true);
    }
  });
});

describe('bowlBobOffset', () => {
  it('is zero before the orbit window', () => {
    expect(bowlBobOffset(0)).toBeCloseTo(0, 6);
  });

  it('stays within the documented amplitude', () => {
    for (let p = 0; p <= 1; p += 0.01) {
      expect(Math.abs(bowlBobOffset(p))).toBeLessThanOrEqual(0.013);
    }
  });

  it('produces finite values across the range', () => {
    for (let p = 0; p <= 1; p += 0.01) {
      expect(Number.isFinite(bowlBobOffset(p))).toBe(true);
    }
  });
});