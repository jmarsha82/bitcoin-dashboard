export type MinerStatus = 'online' | 'watch' | 'offline';

export interface Miner {
  id: string;
  model: string;
  location: string;
  hashrateTh: number;
  powerWatts: number;
  temperatureC: number;
  efficiencyJth: number;
  status: MinerStatus;
  pool: string;
  uptimeHours: number;
}

export interface Pool {
  id: string;
  name: string;
  url: string;
  payoutMode: 'FPPS' | 'PPS+' | 'PPLNS';
  feePercent: number;
  latencyMs: number;
  status: 'connected' | 'degraded' | 'standby';
}

export interface ProfitInputs {
  btcPriceUsd: number;
  networkHashrateEh: number;
  blockRewardBtc: number;
  blocksPerDay: number;
  electricityUsdKwh: number;
  poolFeePercent: number;
}

export interface ProfitSummary {
  grossBtcDay: number;
  grossUsdDay: number;
  electricityUsdDay: number;
  poolFeesUsdDay: number;
  netUsdDay: number;
  breakEvenElectricityUsdKwh: number;
}

export interface MinerEngineAdapter {
  id: string;
  label: string;
  mode: 'asic-controller' | 'raw-miner-experimental';
  enabled: boolean;
  capabilities: string[];
}

export const miners: Miner[] = [
  {
    id: 'R01-A1',
    model: 'Antminer S21 Pro',
    location: 'Rack 01 / Bay A',
    hashrateTh: 231,
    powerWatts: 3530,
    temperatureC: 68,
    efficiencyJth: 15.3,
    status: 'online',
    pool: 'Foundry USA',
    uptimeHours: 412
  },
  {
    id: 'R01-A2',
    model: 'WhatsMiner M60S',
    location: 'Rack 01 / Bay B',
    hashrateTh: 186,
    powerWatts: 3440,
    temperatureC: 74,
    efficiencyJth: 18.5,
    status: 'watch',
    pool: 'Foundry USA',
    uptimeHours: 97
  },
  {
    id: 'R02-C1',
    model: 'Antminer S19 XP',
    location: 'Garage intake',
    hashrateTh: 141,
    powerWatts: 3010,
    temperatureC: 61,
    efficiencyJth: 21.3,
    status: 'online',
    pool: 'Luxor',
    uptimeHours: 289
  },
  {
    id: 'LAB-01',
    model: 'USB SHA-256 dev stick',
    location: 'Engine Lab',
    hashrateTh: 0.006,
    powerWatts: 18,
    temperatureC: 43,
    efficiencyJth: 3000,
    status: 'offline',
    pool: 'Regtest only',
    uptimeHours: 0
  }
];

export const pools: Pool[] = [
  {
    id: 'foundry',
    name: 'Foundry USA',
    url: 'stratum+tcp://btc.foundry.example:3333',
    payoutMode: 'FPPS',
    feePercent: 2,
    latencyMs: 28,
    status: 'connected'
  },
  {
    id: 'luxor',
    name: 'Luxor',
    url: 'stratum+tcp://btc.luxor.example:700',
    payoutMode: 'PPS+',
    feePercent: 2.5,
    latencyMs: 42,
    status: 'connected'
  },
  {
    id: 'solo',
    name: 'Solo / Regtest',
    url: 'stratum+tcp://127.0.0.1:18444',
    payoutMode: 'PPLNS',
    feePercent: 0,
    latencyMs: 3,
    status: 'standby'
  }
];

export const engineAdapters: MinerEngineAdapter[] = [
  {
    id: 'asic-fleet',
    label: 'ASIC Fleet Controller',
    mode: 'asic-controller',
    enabled: true,
    capabilities: ['Stratum pool profiles', 'Thermal watchdog', 'Power-aware scheduling']
  },
  {
    id: 'raw-sha256',
    label: 'Raw Miner Engine',
    mode: 'raw-miner-experimental',
    enabled: false,
    capabilities: ['Header template input', 'Nonce range worker', 'Regtest/testnet target only']
  }
];

export const defaultProfitInputs: ProfitInputs = {
  btcPriceUsd: 61000,
  networkHashrateEh: 650,
  blockRewardBtc: 3.125,
  blocksPerDay: 144,
  electricityUsdKwh: 0.085,
  poolFeePercent: 2
};

export function getFleetHashrate(minerList: Miner[]): number {
  return minerList
    .filter((miner) => miner.status !== 'offline')
    .reduce((total, miner) => total + miner.hashrateTh, 0);
}

export function getFleetPowerWatts(minerList: Miner[]): number {
  return minerList
    .filter((miner) => miner.status !== 'offline')
    .reduce((total, miner) => total + miner.powerWatts, 0);
}

export function getAverageEfficiency(minerList: Miner[]): number {
  const active = minerList.filter((miner) => miner.status !== 'offline');
  const hashrate = getFleetHashrate(active);

  if (hashrate === 0) {
    return 0;
  }

  return getFleetPowerWatts(active) / hashrate;
}

export function estimateProfit(
  minerList: Miner[],
  inputs: ProfitInputs
): ProfitSummary {
  const hashrateTh = getFleetHashrate(minerList);
  const powerKw = getFleetPowerWatts(minerList) / 1000;
  const networkHashrateTh = inputs.networkHashrateEh * 1_000_000;
  const networkBtcDay = inputs.blockRewardBtc * inputs.blocksPerDay;
  const grossBtcDay = networkHashrateTh > 0 ? (hashrateTh / networkHashrateTh) * networkBtcDay : 0;
  const grossUsdDay = grossBtcDay * inputs.btcPriceUsd;
  const electricityUsdDay = powerKw * 24 * inputs.electricityUsdKwh;
  const poolFeesUsdDay = grossUsdDay * (inputs.poolFeePercent / 100);
  const netUsdDay = grossUsdDay - electricityUsdDay - poolFeesUsdDay;
  const breakEvenElectricityUsdKwh =
    powerKw > 0 ? (grossUsdDay - poolFeesUsdDay) / (powerKw * 24) : 0;

  return {
    grossBtcDay,
    grossUsdDay,
    electricityUsdDay,
    poolFeesUsdDay,
    netUsdDay,
    breakEvenElectricityUsdKwh
  };
}

export function formatHashrate(th: number): string {
  if (th >= 1000) {
    return `${(th / 1000).toFixed(2)} PH/s`;
  }

  if (th < 1) {
    return `${(th * 1000).toFixed(1)} GH/s`;
  }

  return `${th.toFixed(1)} TH/s`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}
