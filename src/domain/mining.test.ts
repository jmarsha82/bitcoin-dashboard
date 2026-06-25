import { describe, expect, it } from 'vitest';
import {
  defaultProfitInputs,
  estimateProfit,
  formatCurrency,
  formatHashrate,
  getAverageEfficiency,
  getFleetHashrate,
  getFleetPowerWatts,
  miners
} from './mining';

describe('mining domain calculations', () => {
  it('totals active fleet hashrate and power only', () => {
    expect(getFleetHashrate(miners)).toBeCloseTo(558);
    expect(getFleetPowerWatts(miners)).toBe(9980);
  });

  it('calculates weighted average efficiency', () => {
    expect(getAverageEfficiency(miners)).toBeCloseTo(17.89, 2);
  });

  it('returns zero efficiency when no miners are active', () => {
    const inactive = miners.map((miner) => ({ ...miner, status: 'offline' as const }));

    expect(getAverageEfficiency(inactive)).toBe(0);
  });

  it('estimates gross, costs, fees, and net profit', () => {
    const summary = estimateProfit(miners, defaultProfitInputs);

    expect(summary.grossBtcDay).toBeGreaterThan(0);
    expect(summary.grossUsdDay).toBeGreaterThan(summary.poolFeesUsdDay);
    expect(summary.electricityUsdDay).toBeCloseTo(20.36, 2);
    expect(summary.netUsdDay).toBeLessThan(summary.grossUsdDay);
    expect(summary.breakEvenElectricityUsdKwh).toBeGreaterThan(0);
  });

  it('handles zero network and zero power inputs without division failures', () => {
    const inactive = miners.map((miner) => ({ ...miner, status: 'offline' as const }));
    const summary = estimateProfit(inactive, { ...defaultProfitInputs, networkHashrateEh: 0 });

    expect(summary.grossBtcDay).toBe(0);
    expect(summary.netUsdDay).toBe(0);
    expect(summary.breakEvenElectricityUsdKwh).toBe(0);
  });

  it('formats operational numbers for the UI', () => {
    expect(formatHashrate(1250)).toBe('1.25 PH/s');
    expect(formatHashrate(0.006)).toBe('6.0 GH/s');
    expect(formatHashrate(231)).toBe('231.0 TH/s');
    expect(formatCurrency(12.345)).toBe('$12.35');
  });
});
