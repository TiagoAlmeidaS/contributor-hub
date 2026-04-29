// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");

import { createVaultAPI, VaultAPI } from './api.js';
import { createVaultPrivateState } from './witnesses.js';

async function main() {
  console.log('🚀 Deploying Private Vault Contract to Midnight...');

  try {
    const api = await createVaultAPI({
      contractAddress: process.env.CONTRACT_ADDRESS,
    });

    console.log('✅ Contract API initialized');
    console.log('📝 Call initVault() with your coin info to initialize the vault');
    console.log('📊 Use getVaultState() to check vault status');

    // Example initialization (commented out - requires actual coin info)
    // const result = await api.initVault(coinInfo);
    // console.log(result);

  } catch (error) {
    console.error('❌ Deployment failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);
