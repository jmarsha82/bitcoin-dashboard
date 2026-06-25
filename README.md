# Bitcoin Dashboard

HashDesk is a Bitcoin mining operations dashboard for monitoring ASIC fleet health, pool routing, and profitability. It also includes an Engine Lab adapter boundary so a future raw miner implementation can be added without coupling it directly to the dashboard UI.

## Run locally

```bash
npm install
npm run dev
```

The dev server runs on Vite and prints the local URL, usually `http://127.0.0.1:5173`.

## Verify

```bash
npm run build
npm run test:coverage
npm audit --audit-level=moderate
```

## Future raw miner path

The raw miner extension point starts in `src/domain/mining.ts` with the `MinerEngineAdapter` contract and the Engine Lab UI. A future implementation should keep raw SHA-256, block-template, nonce-range, and Stratum/testnet/regtest behavior behind that adapter instead of placing mining logic directly in React components.
