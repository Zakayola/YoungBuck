#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-local.sh — One-shot local Stellar testnet setup for YoungBuck
#
# This script:
#   1. Generates a fresh Stellar keypair for local development
#   2. Funds it via Friendbot (testnet faucet)
#   3. Builds and deploys the Soroban LedgerContract
#   4. Initialises the contract with a 0.3% fee (30 bps)
#   5. Writes the contract ID into apps/web/.env.local
#
# Requirements:
#   - Rust + wasm32-unknown-unknown target
#   - Stellar CLI: cargo install --locked stellar-cli
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

NETWORK="testnet"
NETWORK_URL="https://soroban-testnet.stellar.org"
HORIZON_URL="https://horizon-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "🚀 YoungBuck — Soroban Local Deploy"
echo "────────────────────────────────────"

# 1. Generate deployer keypair
echo "→ Generating deployer keypair..."
KEYPAIR=$(stellar keys generate deployer --network testnet 2>&1 || true)
DEPLOYER_ADDRESS=$(stellar keys address deployer)
echo "  Deployer: $DEPLOYER_ADDRESS"

# 2. Fund via Friendbot
echo "→ Funding account via Friendbot..."
curl -s "https://friendbot.stellar.org?addr=$DEPLOYER_ADDRESS" | \
  python3 -c "import sys,json; r=json.load(sys.stdin); print('  Funded! Hash:', r.get('hash','(check Horizon)'))" \
  || echo "  (Friendbot may have already funded this account)"

# 3. Build the contract
echo "→ Building Soroban contract..."
cd contracts/soroban
cargo build --target wasm32-unknown-unknown --release --quiet
WASM_PATH="target/wasm32-unknown-unknown/release/youngbuck_ledger.wasm"
echo "  Built: $WASM_PATH"

# 4. Deploy
echo "→ Deploying contract to $NETWORK..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source deployer \
  --network "$NETWORK")
echo "  Contract ID: $CONTRACT_ID"

# 5. Initialise contract (30 bps = 0.3% fee)
echo "→ Initialising contract (fee: 30 bps)..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source deployer \
  --network "$NETWORK" \
  -- init \
  --admin "$DEPLOYER_ADDRESS" \
  --fee_bps 30
echo "  Contract initialised."

# 6. Write env vars
cd ../..
ENV_FILE="apps/web/.env.local"
echo "→ Writing $ENV_FILE..."
cat > "$ENV_FILE" << ENVEOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_HORIZON_URL=$HORIZON_URL
NEXT_PUBLIC_STELLAR_NETWORK=$NETWORK
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=$CONTRACT_ID
ENVEOF

echo ""
echo "✅ Deploy complete!"
echo "────────────────────────────────────"
echo "  Network:     $NETWORK"
echo "  Contract ID: $CONTRACT_ID"
echo "  Deployer:    $DEPLOYER_ADDRESS"
echo ""
echo "Start the dev servers:"
echo "  yarn api   # Terminal 1"
echo "  yarn web   # Terminal 2"
