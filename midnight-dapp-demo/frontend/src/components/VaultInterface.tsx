import { useState } from 'react';

interface VaultInterfaceProps {
  walletAddress: string;
}

export default function VaultInterface({ walletAddress }: VaultInterfaceProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [vaultState, setVaultState] = useState<{
    initialized: boolean;
    deposits: bigint;
    withdrawals: bigint;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitVault = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Call contract initVault circuit
      const response = await fetch('/api/vault/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      setMessage(data.message || 'Vault initialized!');
      await fetchVaultState();
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/vault/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          amount: depositAmount,
        }),
      });
      const data = await response.json();
      setMessage(data.message || 'Deposit successful!');
      setDepositAmount('');
      await fetchVaultState();
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/vault/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          amount: withdrawAmount,
        }),
      });
      const data = await response.json();
      setMessage(data.message || 'Withdrawal successful!');
      setWithdrawAmount('');
      await fetchVaultState();
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaultState = async () => {
    try {
      const response = await fetch(`/api/vault/state?address=${walletAddress}`);
      const data = await response.json();
      setVaultState(data);
    } catch (error) {
      console.error('Failed to fetch vault state:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Private Vault Interface</h2>
      <p>Wallet: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}</p>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.section}>
        <h3>Initialize Vault</h3>
        <button onClick={handleInitVault} disabled={loading || !walletAddress} style={styles.button}>
          {loading ? 'Processing...' : 'Initialize Vault'}
        </button>
      </div>

      <div style={styles.section}>
        <h3>Deposit Tokens</h3>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount to deposit"
          style={styles.input}
        />
        <button onClick={handleDeposit} disabled={loading || !walletAddress || !depositAmount} style={styles.button}>
          Deposit
        </button>
      </div>

      <div style={styles.section}>
        <h3>Withdraw Tokens</h3>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount to withdraw"
          style={styles.input}
        />
        <button onClick={handleWithdraw} disabled={loading || !walletAddress || !withdrawAmount} style={styles.button}>
          Withdraw
        </button>
      </div>

      <div style={styles.section}>
        <h3>Vault State</h3>
        <button onClick={fetchVaultState} disabled={!walletAddress} style={styles.button}>
          Refresh State
        </button>
        {vaultState && (
          <div style={styles.stateDisplay}>
            <p>Initialized: {vaultState.initialized ? 'Yes' : 'No'}</p>
            <p>Total Deposits: {vaultState.deposits.toString()}</p>
            <p>Total Withdrawals: {vaultState.withdrawals.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '30px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  input: {
    padding: '8px',
    fontSize: '16px',
    marginRight: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '8px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  message: {
    padding: '10px',
    marginBottom: '20px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
  },
  stateDisplay: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
};
