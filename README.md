# YoungBuck

> **Stellar-native Web3 + SaaS platform** — decentralised finance tooling for the next generation of builders.
> Maintained by [Zakayola](https://github.com/zakayola).

[![CI](https://github.com/zakayola/youngbuck/actions/workflows/ci.yml/badge.svg)](https://github.com/zakayola/youngbuck/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Stellar](https://img.shields.io/badge/stellar-soroban-blue)](https://stellar.org/soroban)

---

## Overview

YoungBuck is a production-grade monorepo that combines a **Next.js SaaS dashboard** with **Soroban smart contracts** on the Stellar network (on-chain transaction ledger). It is designed as a contributor-ready foundation for teams building Stellar-native financial products.

The repository follows a **Turborepo** workspace layout with shared packages for the UI component library, utility functions, and a typed SDK that wraps both the REST API and the Stellar network layer.

---

## Features

- **Authentication** — JWT-based register / login flow with bcrypt password hashing
- **Dashboard** — live stats (transaction count, XLM volume, active wallets, avg fee)
- **Transaction ledger** — create, list, and inspect transactions through the REST API
- **Soroban LedgerContract** — on-chain registry of platform transactions with configurable basis-point fees, written in Rust
- **Stellar SDK wrapper** — query accounts, balances, and payments via Horizon; build and submit XDR transactions
- **SDK** — typed, tree-shakeable client for the API and Stellar network
- **Shared UI** — `Button`, `Card`, `Badge`, `Spinner` — inline-styled, zero-dependency React components
- **CI/CD** — GitHub Actions pipeline: lint → build → test (API + Soroban contracts) on every PR

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, CSS Modules |
| Backend | Node.js, Express, TypeScript, Stellar SDK |
| Smart Contracts | Soroban (Rust), Stellar network |
| SDK | TypeScript, @stellar/stellar-sdk |
| Monorepo | Turborepo, Yarn Workspaces |
| CI/CD | GitHub Actions |

---

## Repository Structure

```
youngbuck/
├── apps/
│   ├── web/                  # Next.js 14 frontend (App Router)
│   │   ├── app/
│   │   │   ├── login/        # Login page + CSS module
│   │   │   ├── register/     # Registration page + CSS module
│   │   │   └── dashboard/    # Main dashboard page + CSS module
│   │   ├── components/       # App-level components (Navbar, StatCard, TransactionTable)
│   │   └── lib/
│   │       ├── auth.ts       # Session helpers (token + user persistence)
│   │       └── stellar.ts    # Stellar API helpers (account, payments, XDR)
│   └── api/                  # Express REST API
│       └── src/
│           ├── config/       # DB store + JWT helpers
│           ├── controllers/  # Route handler functions (incl. stellar.controller)
│           ├── middleware/   # Auth, error, notFound
│           ├── routes/       # Express routers (incl. stellar.routes)
│           └── services/     # Business logic (incl. stellar.service)
│
├── contracts/
│   └── soroban/              # Soroban smart contract (Rust)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs        # LedgerContract — deposit, settle, query
│           └── test.rs       # Unit tests
│
├── packages/
│   ├── ui/                   # Shared React components (Button, Card, Badge, Spinner)
│   ├── utils/                # Pure helpers (format, address, storage, validation)
│   ├── types/                # Shared TypeScript types (Stellar-aligned)
│   └── sdk/                  # Typed API client + Stellar interaction layer
│       └── src/
│           ├── api/          # authApi, dashboardApi, transactionsApi, usersApi
│           └── stellar/      # account.ts, transaction.ts
│
├── scripts/
│   └── deployment/           # deploy-local.sh — one-shot Stellar testnet deploy
│
├── .github/
│   └── workflows/
│       └── ci.yml            # Lint → Build → Test (API + Soroban) pipeline
│
├── turbo.json
├── package.json
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Setup

### Prerequisites

| Tool | Minimum version | Install |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| Yarn | 1.22.x | `npm i -g yarn` |
| Rust | stable | [rustup.rs](https://rustup.rs) |
| Stellar CLI | latest | `cargo install --locked stellar-cli` |

### 1 — Clone and install

```bash
git clone https://github.com/zakayola/youngbuck.git
cd youngbuck
yarn install
```

### 2 — Configure environment variables

```bash
cp apps/api/.env.example  apps/api/.env
cp apps/web/.env.example  apps/web/.env.local
```

The defaults point to Stellar testnet and work out of the box. Do not commit any `.env` file.

### 3 — Start the API

```bash
yarn api
# → http://localhost:4000
```

### 4 — Start the frontend

```bash
yarn web
# → http://localhost:3000
```

Log in with the seeded account: **alice@youngbuck.io / password123**

### 5 — (Optional) Deploy the Soroban contract

```bash
# Add the wasm32 target (one-time)
rustup target add wasm32-unknown-unknown

# One-shot deploy to Stellar testnet
bash scripts/deployment/deploy-local.sh
```

This generates a keypair, funds it via Friendbot, deploys the `LedgerContract`, initialises it, and writes the contract ID into `apps/web/.env.local`.

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create a new account |
| `POST` | `/api/auth/login` | No | Login, receive JWT |
| `GET` | `/api/users/me` | Yes | Get current user profile |
| `PATCH` | `/api/users/me` | Yes | Update name / Stellar wallet address |
| `GET` | `/api/transactions` | Yes | List transactions (paginated) |
| `GET` | `/api/transactions/:id` | Yes | Get single transaction |
| `POST` | `/api/transactions` | Yes | Record a new transaction |
| `GET` | `/api/stats` | Yes | Get dashboard stats |
| `GET` | `/api/stellar/account/:publicKey` | Yes | Fetch Stellar account from Horizon |
| `GET` | `/api/stellar/payments/:publicKey` | Yes | Fetch recent Stellar payments |
| `POST` | `/api/stellar/transaction/build` | Yes | Build payment XDR for client signing |
| `POST` | `/api/stellar/transaction/submit` | Yes | Submit signed XDR to Stellar network |
| `GET` | `/health` | No | Health check |

---

## Soroban Contract

The `LedgerContract` (`contracts/soroban/src/lib.rs`) is a Rust-based Soroban smart contract that records platform transactions on the Stellar network.

### Functions

| Function | Description |
|---|---|
| `init(admin, fee_bps)` | Initialise the contract — called once by the deployer |
| `deposit(sender, recipient, amount, ref_id)` | Record a transaction entry, deduct fee |
| `settle(index)` | Mark an entry as settled (admin only) |
| `set_fee_bps(new_fee)` | Update the platform fee (admin only, max 500 bps) |
| `get_entry(index)` | Fetch a single entry by index |
| `get_entries(offset, limit)` | Fetch a paginated slice of entries |
| `entry_count()` | Returns total number of recorded entries |
| `fee_bps()` | Returns current fee in basis points |

### Build & test locally

```bash
cd contracts/soroban

# Run unit tests
cargo test

# Build the WASM binary
cargo build --target wasm32-unknown-unknown --release
```

---

## Running Tests

```bash
# API tests
yarn workspace @zakayola/api test

# Soroban contract tests
cd contracts/soroban && cargo test
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

[MIT](./LICENSE) © 2024 Zakayola
