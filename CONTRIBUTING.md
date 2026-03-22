# Contributing to YoungBuck

Thank you for your interest in contributing to YoungBuck. This document covers everything you need to get your environment running, understand the codebase conventions, and submit a pull request that gets merged quickly.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Project Structure Quick Reference](#project-structure-quick-reference)
4. [Development Workflow](#development-workflow)
5. [Code Style Guidelines](#code-style-guidelines)
6. [Commit Convention](#commit-convention)
7. [Pull Request Guidelines](#pull-request-guidelines)
8. [Writing Tests](#writing-tests)
9. [Working with Soroban Contracts](#working-with-soroban-contracts)
10. [Environment Variables](#environment-variables)

---

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) v2.1. By participating you agree to uphold a respectful, harassment-free environment for everyone.

---

## Getting Started

### Prerequisites

| Tool | Minimum version | Install |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| Yarn | 1.22.x | `npm i -g yarn` |
| Rust | stable | [rustup.rs](https://rustup.rs) |
| Stellar CLI | latest | `cargo install --locked stellar-cli` |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

A Stellar-compatible browser wallet (e.g. [Freighter](https://www.freighter.app/)) is useful if you are working on the contract or SDK layers.

### Fork and clone

```bash
# 1. Fork the repo on GitHub, then:
git clone https://github.com/<your-handle>/youngbuck.git
cd youngbuck

# 2. Add the upstream remote
git remote add upstream https://github.com/zakayola/youngbuck.git
```

### Install dependencies

```bash
yarn install
git add yarn.lock && git commit -m "chore(deps): update yarn.lock"
```

### Configure environment

```bash
cp apps/api/.env.example  apps/api/.env
cp apps/web/.env.example  apps/web/.env.local
```

The defaults point to Stellar testnet and work out of the box for local development. Do not commit any `.env` file.

### Start the development servers

```bash
yarn api   # Express API → http://localhost:4000
yarn web   # Next.js    → http://localhost:3000
```

---

## Project Structure Quick Reference

```
youngbuck/
├── apps/api/src/
│   ├── controllers/      # One file per route group
│   ├── middleware/       # auth, error, notFound
│   ├── routes/           # Express routers
│   └── services/         # Business logic (incl. stellar.service.ts)
├── apps/web/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Page-level React components
│   └── lib/              # auth.ts, stellar.ts helpers
├── contracts/soroban/    # Rust Soroban smart contract
│   └── src/
│       ├── lib.rs        # Contract logic
│       └── test.rs       # Unit tests
└── packages/
    ├── sdk/src/
    │   ├── api/          # REST API client modules
    │   └── stellar/      # Stellar account + transaction helpers
    ├── types/src/        # Shared TypeScript interfaces
    └── utils/src/        # Pure helper functions
```

---

## Development Workflow

```bash
# Run everything
yarn dev         # starts API + web in parallel (if configured)
yarn api         # API only
yarn web         # web only

# Lint all packages
yarn lint

# Build all packages
yarn build

# Run all tests
yarn test
```

All commands run through Turborepo — it understands the dependency graph and only rebuilds what has changed.

---

## Code Style Guidelines

- **TypeScript everywhere** — no `.js` files in `apps/` or `packages/`
- **No `any`** — use proper types. If you need to escape the type system temporarily, leave a `// TODO:` comment explaining why
- **Stellar addresses** — always validate with `isValidAddress()` from `@zakayola/utils` before use
- **XLM amounts** — always use string representation (not `number` or `float`) to avoid floating-point precision errors
- **Async/await** — prefer over `.then()` chains. Always `void` top-level promises that are intentionally fire-and-forget
- **Rust** — follow `rustfmt` defaults. Run `cargo fmt` before committing contract changes

---

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps, config |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `refactor` | Code change that is neither a fix nor a feature |
| `ci` | CI/CD pipeline changes |

**Scopes**: `api`, `web`, `sdk`, `contracts`, `ui`, `utils`, `types`, `deps`, `ci`

Examples:
```
feat(api): add Stellar payment build endpoint
fix(sdk): handle missing account on getXlmBalance
chore(deps): upgrade @stellar/stellar-sdk to 12.1.0
docs(contracts): document settle function parameters
```

---

## Pull Request Guidelines

1. **Branch from `develop`**, not `main`
2. **One concern per PR** — don't bundle unrelated changes
3. **All CI checks must pass** before requesting review
4. **Add or update tests** for any logic change
5. **Update documentation** if you change a public API or add a new env var
6. **Keep the PR description** concise: what changed and why

---

## Writing Tests

### API tests (Jest + Supertest)

Tests live in `apps/api/src/__tests__/`. Run them with:

```bash
yarn workspace @zakayola/api test
```

Guidelines:
- Test the HTTP layer via Supertest, not the service layer directly
- Seed data is handled automatically by `seedIfEmpty()` in `db.ts`
- Use `JWT_SECRET=ci-test-secret` in your test environment

### Soroban contract tests (Rust)

Tests live in `contracts/soroban/src/test.rs`. Run them with:

```bash
cd contracts/soroban && cargo test
```

Guidelines:
- Use `Env::default()` + `env.mock_all_auths()` for unit tests
- Test each public function: `init`, `deposit`, `settle`, `set_fee_bps`, `get_entries`
- Test edge cases: zero amount, pagination boundaries, auth failures

---

## Working with Soroban Contracts

### Prerequisites

```bash
# Add WASM compilation target (one-time)
rustup target add wasm32-unknown-unknown

# Install Stellar CLI (one-time)
cargo install --locked stellar-cli
```

### Local development cycle

```bash
# 1. Edit contracts/soroban/src/lib.rs

# 2. Run tests
cd contracts/soroban && cargo test

# 3. Build the WASM binary
cargo build --target wasm32-unknown-unknown --release

# 4. Deploy to testnet
bash scripts/deployment/deploy-local.sh
```

### Deploying manually

```bash
# Add a testnet identity (one-time)
stellar keys generate mykey --network testnet

# Fund via Friendbot
curl "https://friendbot.stellar.org?addr=$(stellar keys address mykey)"

# Deploy contract
stellar contract deploy \
  --wasm contracts/soroban/target/wasm32-unknown-unknown/release/youngbuck_ledger.wasm \
  --source mykey \
  --network testnet

# Invoke a function
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source mykey \
  --network testnet \
  -- entry_count
```

### Contract upgrade

Soroban contracts are upgradeable. After deploying a new WASM:

```bash
stellar contract install \
  --wasm contracts/soroban/target/wasm32-unknown-unknown/release/youngbuck_ledger.wasm \
  --source mykey \
  --network testnet
```

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `JWT_SECRET` | `apps/api/.env` | JWT signing key — must be set in production |
| `JWT_EXPIRES_IN` | `apps/api/.env` | Token lifetime, default `24h` |
| `PORT` | `apps/api/.env` | API server port, default `4000` |
| `CORS_ORIGIN` | `apps/api/.env` | Allowed frontend origin |
| `HORIZON_URL` | `apps/api/.env` | Stellar Horizon endpoint (server-side) |
| `STELLAR_NETWORK` | `apps/api/.env` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_API_URL` | `apps/web/.env.local` | Backend URL seen by the browser |
| `NEXT_PUBLIC_HORIZON_URL` | `apps/web/.env.local` | Horizon URL seen by the browser |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `apps/web/.env.local` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_SOROBAN_CONTRACT_ID` | `apps/web/.env.local` | Deployed LedgerContract ID |

Never commit `.env` files. All secrets must be injected at runtime via CI secrets or a secrets manager in production.
