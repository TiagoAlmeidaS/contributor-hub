import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import VaultInterface from './components/VaultInterface';

function App() {
  const [walletAddress, setWalletAddress] = useState('');

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>🌙 Midnight Private Vault dApp</h1>
        <p>Full-Stack Demo: Compact Contract + TypeScript API + React Frontend</p>
      </header>

      <main style={styles.main}>
        <WalletConnect onConnect={handleWalletConnect} />

        {walletAddress && (
          <VaultInterface walletAddress={walletAddress} />
        )}

        {!walletAddress && (
          <div style={styles.placeholder}>
            <p>Please connect your wallet (Lace or 1AM) to interact with the Private Vault.</p>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p>Built on Midnight Network | Privacy by Default</p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '20px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    textAlign: 'center' as const,
  },
  main: {
    flex: 1,
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  },
  placeholder: {
    padding: '40px',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  footer: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    textAlign: 'center' as const,
  },
};

export default App;
