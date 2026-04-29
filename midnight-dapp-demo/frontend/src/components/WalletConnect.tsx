import { useState, useEffect } from 'react';
import { useMidnightWallet } from '@midnight-ntwrk/dapp-connector';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const { connect, disconnect, isConnected, address } = useMidnightWallet();

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please ensure Lace or 1AM wallet extension is installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWalletAddress('');
      onConnect('');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Wallet Connection</h2>
      {isConnected ? (
        <div>
          <p>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          <button onClick={handleDisconnect} style={styles.button}>
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={isConnecting} style={styles.button}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet (Lace/1AM)'}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
};
