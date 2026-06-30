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
npm test
npm run test:coverage
npm audit --audit-level=moderate
```

## Unit tests

All unit tests live in the top-level `tests` directory. Vitest is configured in `vite.config.ts` to run `tests/**/*.test.{ts,tsx}` and to load shared test setup from `tests/setup.ts`.

- `npm test` runs the unit test suite once.
- `npm run test:coverage` runs the unit test suite with V8 coverage and enforces the repository's 90% line coverage threshold.

## GitHub pipeline

The GitHub Actions pipeline is defined in `.github/workflows/ci.yml` and can run on pushes to `main` or `master`, pull requests, and manual dispatches.

- `Unit Tests` installs dependencies with `npm ci` and runs `npm run test:coverage`.
- `Build` runs after unit tests and verifies the production build with `npm run build`.
- `Code Scanning / Quality` runs CodeQL with the `security-and-quality` query suite for JavaScript and TypeScript quality findings.
- `Code Scanning / Security` runs CodeQL with the `security-extended` query suite, Dependency Review on pull requests, and `npm audit --audit-level=moderate`.

CodeQL code scanning and Dependency Review are available at no extra cost for public repositories. Private repositories may need GitHub Code Security or GitHub Advanced Security enabled before those jobs can upload results.

Dependabot is configured in `.github/dependabot.yml` to open weekly update PRs for npm packages and GitHub Actions.

## Future raw miner path

The raw miner extension point starts in `src/domain/mining.ts` with the `MinerEngineAdapter` contract and the Engine Lab UI. A future implementation should keep raw SHA-256, block-template, nonce-range, and Stratum/testnet/regtest behavior behind that adapter instead of placing mining logic directly in React components.
