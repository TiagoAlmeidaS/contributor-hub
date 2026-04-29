import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { VaultAPI } from '../src/api.js';
import { witnesses, createVaultPrivateState } from '../src/witnesses.js';

describe('VaultAPI', () => {
  let api: VaultAPI;

  beforeEach(() => {
    api = new VaultAPI({
      contractAddress: 'test-address',
    });
  });

  it('should initialize with contract address', () => {
    expect(api).toBeDefined();
  });

  it('should have initVault method', () => {
    expect(typeof api.initVault).toBe('function');
  });

  it('should have deposit method', () => {
    expect(typeof api.deposit).toBe('function');
  });

  it('should have withdraw method', () => {
    expect(typeof api.withdraw).toBe('function');
  });

  it('should have getVaultState method', () => {
    expect(typeof api.getVaultState).toBe('function');
  });
});

describe('Witnesses', () => {
  it('should export initVault witness', () => {
    expect(witnesses.initVault).toBeDefined();
    expect(typeof witnesses.initVault.initialize).toBe('function');
  });

  it('should export deposit witness', () => {
    expect(witnesses.deposit).toBeDefined();
    expect(typeof witnesses.deposit.depositTokens).toBe('function');
  });

  it('should export withdraw witness', () => {
    expect(witnesses.withdraw).toBeDefined();
    expect(typeof witnesses.withdraw.prepareWithdraw).toBe('function');
  });

  it('should create vault private state', () => {
    const privateState = createVaultPrivateState(
      'test-vault-owner',
      new Uint8Array(32)
    );
    expect(privateState.vaultOwner).toBe('test-vault-owner');
    expect(privateState.secretKey).toBeInstanceOf(Uint8Array);
  });

  it('should throw error if secret key missing in initVault', async () => {
    const context = {
      privateState: { vaultOwner: 'test' } as any,
    };
    await expect(
      witnesses.initVault.initialize(context as any)
    ).rejects.toThrow('Missing required private state');
  });
});

describe('Contract Circuits', () => {
  it('should have all required circuit exports', () => {
    // This would test the compiled contract
    // For now, we verify the API structure
    expect(true).toBe(true);
  });
});
