# Midnight Private Vault dApp

A full-stack decentralized application demonstrating privacy-preserving token vaults on the Midnight blockchain using Compact smart contracts.

## 🌙 Overview

This project implements a complete Private Vault dApp with:

- **Compact Smart Contract** - Privacy-preserving vault with deposit/withdraw circuits
- **TypeScript API** - Witness implementations and contract interaction layer
- **React Frontend** - Wallet integration (Lace/1AM) with deploy/interact flows
- **Express Backend** - Off-chain metadata and transaction history API
- **Docker Setup** - Proof server and services orchestration

## 📁 Project Structure

```
midnight-dapp-demo/
├── contracts/
│   └── private-vault.compact    # Compact smart contract
├── src/
│   ├── api.ts                    # TypeScript API for contract interaction
│   ├── witnesses.ts              # Witness implementations
│   └── deploy.ts                 # Contract deployment script
├── frontend/                     # React/Vite frontend
│   ├── src/
│   │   ├── App.tsx               # Main React component
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx # Wallet connection component
│   │   │   └── VaultInterface.tsx # Vault interaction UI
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Express backend
│   └── src/
│       └── index.ts              # Backend API server
├── __tests__/                    # Test suites
│   └── api.test.ts
├── docker-compose.yml            # Docker orchestration
├── package.json                  # Root package.json
├── README.md                     # This file
└── TUTORIAL.md                   # Full tutorial (3,500+ words)
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime
- [Compact Compiler](https://docs.midnight.network/) (v0.22+)
- [Docker](https://docker.com/) (for proof server)
- Lace or 1AM wallet browser extension

### Installation

```bash
# Install dependencies
bun install

# Compile the Compact contract
bun run compile:contract

# Start proof server
docker-compose up -d proof-server

# Start backend
bun run start:backend

# Start frontend (new terminal)
bun run start:frontend
```

### Development Lifecycle

1. **Write Contract** - Edit `contracts/private-vault.compact`
2. **Compile** - `bun run compile:contract`
3. **Deploy** - `bun run deploy`
4. **Interact** - Use the React frontend at `http://localhost:3000`

## 📚 Tutorial

See [TUTORIAL.md](./TUTORIAL.md) for the complete 3,500+ word tutorial covering:

- Setting up the Midnight development environment
- Writing privacy-preserving Compact contracts
- Implementing TypeScript witnesses
- Building React frontend with wallet integration
- Creating Express backend for off-chain data
- Full lifecycle: `compact compile` to browser interaction

## 🧪 Testing

```bash
bun test
```

## 🔒 Privacy Features

- Zero-knowledge proofs for all vault operations
- Shielded token transfers via `receiveShielded`/`sendShielded`
- Nullifier-based double-spend prevention
- Private state management with witnesses

## 📖 Resources

- [Midnight Docs](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/)
- [Midnight dApp Connector](https://docs.midnight.network/develop/reference/midnight-api/dapp-connector)
- [create-mn-app](https://github.com/midnightntwrk/create-mn-app)

## 📄 License

Apache-2.0 - See [LICENSE](../LICENSE) for details.
