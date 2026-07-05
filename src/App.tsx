import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bitcoin,
  Cpu,
  Gauge,
  HardDrive,
  PlugZap,
  Settings,
  SlidersHorizontal,
  Thermometer,
  Wallet
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  defaultProfitInputs,
  engineAdapters,
  estimateProfit,
  formatCurrency,
  formatHashrate,
  getAverageEfficiency,
  getFleetHashrate,
  getFleetPowerWatts,
  miners,
  pools,
  type ProfitInputs
} from './domain/mining';

const navItems = [
  { label: 'Overview', icon: BarChart3, active: true },
  { label: 'Fleet', icon: HardDrive },
  { label: 'Pools', icon: PlugZap },
  { label: 'Profit', icon: Wallet },
  { label: 'Engine Lab', icon: Cpu },
  { label: 'Settings', icon: Settings }
];

function StatCard({
  label,
  value,
  detail,
  tone = 'neutral'
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'positive' | 'warning';
}) {
  return (
    <section className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </section>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand">
        <div className="brand-mark">
          <Bitcoin size={24} />
        </div>
        <div>
          <strong>HashDesk</strong>
          <span>Mining ops</span>
        </div>
      </div>
      <nav>
        {navItems.map(({ label, icon: Icon, active }) => (
          <button className={active ? 'active' : ''} key={label} type="button">
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="adapter-note">
        <Cpu size={18} />
        <div>
          <strong>Adapter ready</strong>
          <span>Raw miner can plug into the Engine Lab contract later.</span>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div>
        <h1>Overview</h1>
        <p>ASIC fleet management, pool routing, and profitability control.</p>
      </div>
      <div className="top-actions">
        <button type="button" title="Tune profile">
          <SlidersHorizontal size={18} />
        </button>
        <button className="primary" type="button">
          <Activity size={18} />
          Sync Fleet
        </button>
      </div>
    </header>
  );
}

function FleetTable() {
  return (
    <section className="panel fleet-panel">
      <div className="panel-heading">
        <div>
          <h2>ASIC Health</h2>
          <p>Live operating state for each configured miner.</p>
        </div>
        <button type="button">Export CSV</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unit</th>
              <th>Model</th>
              <th>Hashrate</th>
              <th>Power</th>
              <th>Temp</th>
              <th>Pool</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {miners.map((miner) => (
              <tr key={miner.id}>
                <td>
                  <strong>{miner.id}</strong>
                  <span>{miner.location}</span>
                </td>
                <td>{miner.model}</td>
                <td>{formatHashrate(miner.hashrateTh)}</td>
                <td>{miner.powerWatts.toLocaleString()} W</td>
                <td>{miner.temperatureC} C</td>
                <td>{miner.pool}</td>
                <td>
                  <span className={`status ${miner.status}`}>{miner.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PoolPanel() {
  return (
    <section className="panel">
      <div className="panel-heading compact">
        <h2>Pool Routing</h2>
        <PlugZap size={20} />
      </div>
      <div className="pool-list">
        {pools.map((pool) => (
          <article className="pool-row" key={pool.id}>
            <div>
              <strong>{pool.name}</strong>
              <span>{pool.payoutMode} / {pool.feePercent}% fee</span>
            </div>
            <small className={pool.status}>{pool.latencyMs} ms</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfitCalculator({
  inputs,
  onChange
}: {
  inputs: ProfitInputs;
  onChange: (nextInputs: ProfitInputs) => void;
}) {
  const updateInput = (key: keyof ProfitInputs, value: string) => {
    onChange({ ...inputs, [key]: Number(value) });
  };

  return (
    <section className="panel">
      <div className="panel-heading compact">
        <h2>Profit Controls</h2>
        <Gauge size={20} />
      </div>
      <div className="form-grid">
        <label>
          BTC price
          <input
            aria-label="BTC price"
            min="1000"
            step="500"
            type="number"
            value={inputs.btcPriceUsd}
            onChange={(event) => updateInput('btcPriceUsd', event.target.value)}
          />
        </label>
        <label>
          Power cost / kWh
          <input
            aria-label="Power cost per kWh"
            min="0"
            step="0.005"
            type="number"
            value={inputs.electricityUsdKwh}
            onChange={(event) => updateInput('electricityUsdKwh', event.target.value)}
          />
        </label>
        <label>
          Network EH/s
          <input
            aria-label="Network hashrate"
            min="1"
            step="10"
            type="number"
            value={inputs.networkHashrateEh}
            onChange={(event) => updateInput('networkHashrateEh', event.target.value)}
          />
        </label>
        <label>
          Pool fee %
          <input
            aria-label="Pool fee percent"
            min="0"
            step="0.25"
            type="number"
            value={inputs.poolFeePercent}
            onChange={(event) => updateInput('poolFeePercent', event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

function EngineLab() {
  return (
    <section className="panel engine-panel">
      <div className="panel-heading">
        <div>
          <h2>Engine Lab</h2>
          <p>Adapter boundary for future raw mining experiments.</p>
        </div>
        <span className="experimental">Experimental</span>
      </div>
      {engineAdapters.map((adapter) => (
        <article className="engine-row" key={adapter.id}>
          <div className={adapter.enabled ? 'engine-icon live' : 'engine-icon'}>
            <Cpu size={18} />
          </div>
          <div>
            <strong>{adapter.label}</strong>
            <span>{adapter.capabilities.join(' / ')}</span>
          </div>
          <button disabled={!adapter.enabled} type="button">
            {adapter.enabled ? 'Configure' : 'Locked'}
          </button>
        </article>
      ))}
    </section>
  );
}

export function App() {
  const [inputs, setInputs] = useState(defaultProfitInputs);
  const summary = useMemo(() => estimateProfit(miners, inputs), [inputs]);
  const fleetHashrate = getFleetHashrate(miners);
  const fleetPower = getFleetPowerWatts(miners);
  const averageEfficiency = getAverageEfficiency(miners);

  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <TopBar />
        <section className="metric-grid" aria-label="Fleet metrics">
          <StatCard
            label="Fleet hashrate"
            value={formatHashrate(fleetHashrate)}
            detail={`${miners.filter((miner) => miner.status !== 'offline').length} active ASIC units`}
            tone="positive"
          />
          <StatCard
            label="Power draw"
            value={`${(fleetPower / 1000).toFixed(2)} kW`}
            detail={`${averageEfficiency.toFixed(1)} J/TH average`}
          />
          <StatCard
            label="Daily BTC estimate"
            value={summary.grossBtcDay.toFixed(6)}
            detail={`${formatCurrency(summary.grossUsdDay)} gross revenue`}
          />
          <StatCard
            label="Net profit estimate"
            value={formatCurrency(summary.netUsdDay)}
            detail={`${formatCurrency(summary.electricityUsdDay)} daily power cost`}
            tone={summary.netUsdDay >= 0 ? 'positive' : 'warning'}
          />
        </section>
        <section className="workspace-grid">
          <FleetTable />
          <div className="right-rail">
            <PoolPanel />
            <ProfitCalculator inputs={inputs} onChange={setInputs} />
            <section className="panel alert-panel">
              <AlertTriangle size={20} />
              <div>
                <strong>Break-even power</strong>
                <span>{formatCurrency(summary.breakEvenElectricityUsdKwh)} per kWh</span>
              </div>
            </section>
            <section className="panel heat-panel">
              <Thermometer size={20} />
              <div>
                <strong>Thermal watch</strong>
                <span>One unit above preferred intake curve.</span>
              </div>
            </section>
          </div>
        </section>
        <EngineLab />
      </main>
    </div>
  );
}
