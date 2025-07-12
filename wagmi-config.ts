

import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';

// In a real app, you would use a service like WalletConnect or Infura to get a project ID
// For this example, we use a public RPC but this is not recommended for production.
const publicBaseRpcUrl = 'https://mainnet.base.org';
const publicBaseSepoliaRpcUrl = 'https://sepolia.base.org';

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(publicBaseRpcUrl),
    [baseSepolia.id]: http(publicBaseSepoliaRpcUrl),
  },
  // Connectors can be added here, e.g. from `@wagmi/connectors`
  // for now, it will support browser wallets like MetaMask via EIP-6963
});