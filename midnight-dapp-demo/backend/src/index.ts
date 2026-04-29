// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");

import express from 'express';
import cors from 'cors';
import { createVaultAPI } from '../src/api.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory store for off-chain vault metadata
const vaultMetadata = new Map<string, {
  owner: string;
  createdAt: number;
  transactions: Array<{ type: 'deposit' | 'withdraw'; amount: string; timestamp: number }>;
}>();

// Initialize API
const vaultAPI = await createVaultAPI();

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Initialize vault
app.post('/api/vault/init', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    // Store metadata off-chain
    vaultMetadata.set(walletAddress, {
      owner: walletAddress,
      createdAt: Date.now(),
      transactions: [],
    });

    res.json({ message: 'Vault initialized', address: walletAddress });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Deposit tokens
app.post('/api/vault/deposit', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;
    if (!walletAddress || !amount) {
      return res.status(400).json({ error: 'walletAddress and amount required' });
    }

    // Record transaction off-chain
    const metadata = vaultMetadata.get(walletAddress);
    if (metadata) {
      metadata.transactions.push({
        type: 'deposit',
        amount,
        timestamp: Date.now(),
      });
    }

    res.json({ message: `Deposited ${amount} tokens`, success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Withdraw tokens
app.post('/api/vault/withdraw', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;
    if (!walletAddress || !amount) {
      return res.status(400).json({ error: 'walletAddress and amount required' });
    }

    // Record transaction off-chain
    const metadata = vaultMetadata.get(walletAddress);
    if (metadata) {
      metadata.transactions.push({
        type: 'withdraw',
        amount,
        timestamp: Date.now(),
      });
    }

    res.json({ message: `Withdrew ${amount} tokens`, success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Get vault state
app.get('/api/vault/state', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'address query param required' });
    }

    const metadata = vaultMetadata.get(address);
    const state = await vaultAPI.getVaultState();

    res.json({
      initialized: state[0],
      deposits: state[1].toString(),
      withdrawals: state[2].toString(),
      offChain: metadata || null,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Get transaction history
app.get('/api/vault/history/:address', (req, res) => {
  const { address } = req.params;
  const metadata = vaultMetadata.get(address);

  if (!metadata) {
    return res.status(404).json({ error: 'Vault not found' });
  }

  res.json({ transactions: metadata.transactions });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
