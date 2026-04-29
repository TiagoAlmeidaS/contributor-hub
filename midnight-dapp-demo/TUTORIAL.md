# Full-Stack Midnight dApp Tutorial: Private Vault

> Build a complete privacy-preserving decentralized application on Midnight from scratch — Compact contract, TypeScript API, React frontend with wallet integration, and Express backend.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Writing the Compact Contract](#writing-the-compact-contract)
5. [Compiling the Contract](#compiling-the-contract)
6. [TypeScript Witness Implementations](#typescript-witness-implementations)
7. [Building the API Layer](#building-the-api-layer)
8. [React Frontend with Wallet Integration](#react-frontend-with-wallet-integration)
9. [Express Backend for Off-Chain Data](#express-backend-for-off-chain-data)
10. [Docker Compose Setup](#docker-compose-setup)
11. [Full Lifecycle: Deploy & Interact](#full-lifecycle-deploy--interact)
12. [Testing](#testing)
13. [Next Steps](#next-steps)

---

## Introduction

Midnight Network provides a unique approach to blockchain privacy — everything is private by default, with selective disclosure controlled by zero-knowledge proofs. In this tutorial, you'll build a complete **Private Vault dApp** that demonstrates:

- **Compact smart contracts** with privacy-preserving circuits
- **TypeScript witness implementations** for ZK proof generation
- **React frontend** with Lace/1AM wallet integration via dApp connector
- **Express backend** for off-chain metadata and transaction history
- **Docker Compose** orchestration including the proof server

By the end, you'll have a working dApp that accepts shielded token deposits, tracks vault state privately on-chain, and allows withdrawals — all while preserving privacy through zero-knowledge proofs.

### What You'll Build

The Private Vault contract supports:
- **initVault** — Initialize a new vault with the first deposit
- **deposit** — Merge additional tokens into the existing vault
- **withdraw** — Withdraw tokens with ZK proof verification and nullifier checks
- **getVaultState** — Read public vault metadata

---

## Prerequisites

Before starting, ensure you have:

| Tool | Version | Purpose |
|------|---------|---------|
| Bun | Latest | JavaScript/TypeScript runtime |
| Compact Compiler | >= 0.22 | Compile Compact contracts to ZK circuits |
| Docker | Latest | Run proof server container |
| Node.js | >= 18 | (Optional) Alternative runtime |
| Lace or 1AM Wallet | Latest | Browser extension for transaction signing |

### Installing Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installing Compact Compiler

```bash
npm install -g @midnight-ntwrk/compact-compiler@latest
```

Verify installation:
```bash
compact --version
# Should output >= 0.22.0
```

---

## Project Setup

Create the project structure:

```bash
mkdir midnight-private-vault-demo
cd midnight-private-vault-demo
bun init -y

# Create directories
mkdir -p contracts src frontend/src/components backend/src __tests__
```

### Root package.json

Create `package.json` with the following content (see the file in this repo for the complete configuration):

```json
{
  "name": "midnight-private-vault-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "compile:contract": "compact compile contracts/private-vault.compact contracts/managed",
    "build": "bun build src/index.ts --outdir dist",
    "dev": "bun run --hot src/index.ts",
    "test": "bun test",
    "deploy": "bun run src/deploy.ts",
    "start:backend": "bun run backend/src/index.ts",
    "start:frontend": "cd frontend && bun dev"
  }
}
```

Install dependencies:
```bash
bun install @midnight-ntwrk/compact-runtime @midnight-ntwrk/midnight-js-types @midnight-ntwrk/dapp-connector express cors
bun install -d @types/bun @types/express @types/cors typescript
```

---

## Writing the Compact Contract

Compact is Midnight's domain-specific language for writing ZK-circuit-based smart contracts. Create `contracts/private-vault.compact`:

```compact
pragma language_version >= 0.22;

import token_lib from '@midnight/compact-token-lib';

type Address = Opaque<"Address">;
type Nullifier = Opaque<"Nullifier">;
type ZKProof = Opaque<"ZKProof">;
type ShieldedCoinInfo = Opaque<"ShieldedCoinInfo">;

// Ledger state
export ledger hasShieldedTokens: boolean;
export ledger totalShieldedDeposits: Uint<64>;
export ledger totalWithdrawals: Uint<64>;
export ledger nullifiers: Map<Nullifier, boolean>;
export ledger shieldedVault: token_lib.ZswapShieldedCoin<ShieldedCoinInfo>;
```

### Key Concepts

1. **Ledger State** — On-chain storage visible to the contract
2. **Circuits** — Entry points equivalent to functions, executed as ZK proofs
3. **Opaque Types** — Private inputs that remain hidden from the public ledger
4. **Shielded Tokens** — Privacy-preserving tokens using ZK proofs

### The initVault Circuit

```compact
export circuit initVault(coin: ShieldedCoinInfo): [] {
    assert(!hasShieldedTokens, "vault already initialized");
    token_lib.receiveShielded(token_lib.disclose(coin));
    token_lib.shieldedVault.writeCoin(
        token_lib.disclose(coin),
        token_lib.right<token_lib.ZswapCoinPublicKey, token_lib.ContractAddress>(kernel.self())
    );
    hasShieldedTokens = true;
    totalShieldedDeposits = totalShieldedDeposits + 1;
}
```

This circuit:
- Ensures the vault hasn't been initialized yet
- Receives the shielded coin into the contract
- Writes the coin to the vault with the contract as owner
- Updates ledger state

### The deposit Circuit

```compact
export circuit deposit(coin: ShieldedCoinInfo): [] {
    assert(hasShieldedTokens, "vault not initialized, call initVault first");
    const pot = token_lib.shieldedVault;
    token_lib.receiveShielded(token_lib.disclose(coin));
    const merged = token_lib.mergeCoinImmediate(pot, token_lib.disclose(coin));
    token_lib.shieldedVault.writeCoin(
        merged,
        token_lib.right<token_lib.ZswapCoinPublicKey, token_lib.ContractAddress>(kernel.self())
    );
    totalShieldedDeposits = totalShieldedDeposits + 1;
}
```

This uses `mergeCoinImmediate` to combine the existing vault coin with the new deposit — a key privacy pattern.

### The withdraw Circuit

```compact
export circuit withdraw(
    proof: ZKProof,
    nullifier: Nullifier,
    recipient: Address,
    withdraw_amount: Uint<64>
): [] {
    verify_proof(proof, withdraw_circuit, [nullifier, recipient, withdraw_amount]);
    assert !token_lib.ledger.nullifiers.contains(nullifier), "nullifier already used";
    token_lib.ledger.nullifiers.insert(nullifier, true);

    const vaultCoin = token_lib.shieldedVault.readCoin();
    const result = token_lib.sendShielded(
        vaultCoin,
        token_lib.left<token_lib.ZswapCoinPublicKey, token_lib.ContractAddress>(recipient),
        withdraw_amount
    );

    token_lib.shieldedVault.writeCoin(
        result.change,
        token_lib.right<token_lib.ZswapCoinPublicKey, token_lib.ContractAddress>(kernel.self())
    );

    totalWithdrawals = totalWithdrawals + withdraw_amount;
}
```

---

## Compiling the Contract

Run the compiler:

```bash
bun run compile:contract
```

This generates the `managed/` directory with:
- `compiler/` — Compiler metadata
- `contract/` — JavaScript implementation and TypeScript definitions
- `keys/` — Proving and verifying keys
- `zkir/` — Zero-Knowledge Intermediate Representation

The generated TypeScript bindings provide type-safe interaction with your contract.

---

## TypeScript Witness Implementations

Witnesses provide access to private data during circuit execution. Create `src/witnesses.ts`:

```typescript
import { PrivateState, WitnessContext } from '@midnight-ntwrk/compact-runtime';

export interface VaultPrivateState extends PrivateState {
  readonly vaultOwner: string;
  readonly secretKey: Uint8Array;
}

export const witnesses = {
  initVault: {
    initialize: async (context: WitnessContext<any, VaultPrivateState>) => {
      const { secretKey, vaultOwner } = context.privateState;
      if (!secretKey || !vaultOwner) {
        throw new Error('Missing required private state');
      }
      return {
        circuitInput: vaultOwner,
        privateState: context.privateState,
      };
    },
  },
  // ... see full file in repo
};
```

Witnesses are called by the Compact runtime to provide private inputs needed for proof generation.

---

## Building the API Layer

Create `src/api.ts` to wrap contract interactions:

```typescript
export class VaultAPI {
  async initVault(coinInfo: unknown): Promise<string> {
    // Calls the compiled contract's initVault circuit
    // Generates ZK proof using the witness
    // Submits transaction to Midnight network
  }

  async deposit(coinInfo: unknown): Promise<string> { /* ... */ }
  async withdraw(recipient: string, amount: bigint): Promise<string> { /* ... */ }
  async getVaultState(): Promise<[boolean, bigint, bigint]> { /* ... */ }
}
```

---

## React Frontend with Wallet Integration

### Setting Up Vite + React

```bash
cd frontend
bun create vite . --template react-ts
bun install
bun install @midnight-ntwrk/dapp-connector ethers
```

### Wallet Connection Component

Create `frontend/src/components/WalletConnect.tsx`:

```typescript
import { useMidnightWallet } from '@midnight-ntwrk/dapp-connector';

export default function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const { connect, disconnect, isConnected, address } = useMidnightWallet();

  return (
    <div>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={() => connect()}>Connect Lace/1AM Wallet</button>
      )}
    </div>
  );
}
```

### Vault Interface Component

The `VaultInterface.tsx` component provides:
- Initialize Vault button
- Deposit form with amount input
- Withdraw form with amount input
- Vault state display (initialized, deposits, withdrawals)

---

## Express Backend for Off-Chain Data

Create `backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for off-chain metadata
const vaultMetadata = new Map();

app.post('/api/vault/init', async (req, res) => {
  // Initialize vault metadata off-chain
});

app.post('/api/vault/deposit', async (req, res) => {
  // Record deposit transaction off-chain
});

app.get('/api/vault/state', async (req, res) => {
  // Return vault state (combines on-chain + off-chain data)
});

app.listen(4000, () => console.log('Backend running on :4000'));
```

The backend stores transaction history and metadata that would be inefficient on-chain.

---

## Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  proof-server:
    image: midnightnetwork/proof-server:latest
    ports:
      - "6300:6300"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6300/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    depends_on:
      proof-server:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:4000
```

Start everything:
```bash
docker-compose up -d
```

---

## Full Lifecycle: Deploy & Interact

### 1. Compile Contract
```bash
bun run compile:contract
```

### 2. Start Services
```bash
docker-compose up -d
bun run start:backend  # Terminal 1
bun run start:frontend # Terminal 2
```

### 3. Open Browser
Navigate to `http://localhost:3000`

### 4. Connect Wallet
Click "Connect Wallet" and authorize Lace or 1AM extension

### 5. Initialize Vault
Click "Initialize Vault" — this calls `initVault` circuit

### 6. Deposit Tokens
Enter amount and click "Deposit"

### 7. Withdraw Tokens
Enter amount and click "Withdraw"

### 8. Check State
Click "Refresh State" to see vault status

---

## Testing

Run the test suite:

```bash
bun test
```

Tests cover:
- Witness function behavior
- API method existence and error handling
- Vault state management

Example test:
```typescript
import { describe, it, expect } from 'bun:test';
import { VaultAPI } from '../src/api.js';

describe('VaultAPI', () => {
  it('should initialize with contract address', () => {
    const api = new VaultAPI({ contractAddress: 'test' });
    expect(api).toBeDefined();
  });
});
```

---

## Next Steps

You've built a complete Midnight dApp! Here's what to explore next:

1. **Deploy to Preprod** — Use `create-mn-app` to deploy to Midnight's test network
2. **Add Multi-Signature** — Extend the vault to require multiple approvals
3. **Time-Locked Withdrawals** — Add timelock conditions to the withdraw circuit
4. **Frontend Polish** — Add transaction history UI, better error handling
5. **Indexer Integration** — Connect to Midnight indexer for efficient state queries

### Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Reference](https://docs.midnight.network/compact/)
- [Midnight JS SDK](https://www.npmjs.com/package/@midnight-ntwrk/midnight-js-types)
- [dApp Connector API](https://docs.midnight.network/develop/reference/midnight-api/dapp-connector)
- [Community Forum](https://forum.midnight.network/)
- [Discord](https://discord.com/invite/midnightnetwork)

---

## License

Apache-2.0. See the root LICENSE file for details.

**Built with 🌙 on Midnight Network — Privacy by Default.**
