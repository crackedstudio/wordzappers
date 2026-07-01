import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, WALLET_CONNECTORS } from '@web3auth/modal';
import type { Web3AuthContextConfig } from '@web3auth/modal/react';

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID ?? '';

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chains: [
      {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0xa4ec',               // Celo mainnet = 42220
        rpcTarget: 'https://forno.celo.org',
        displayName: 'Celo Mainnet',
        blockExplorerUrl: 'https://celoscan.io',
        ticker: 'CELO',
        tickerName: 'Celo',
        logo: '',
      },
    ],
    defaultChainId: '0xa4ec',
    modalConfig: {
      connectors: {
        [WALLET_CONNECTORS.AUTH]: {
          label: 'auth',
          loginMethods: {
            google: { name: 'Google', showOnModal: true },
            email_passwordless: { name: 'Email', showOnModal: true },
            apple: { name: 'Apple', showOnModal: true },
          },
          showOnModal: true,
        },
        // Hide all external wallet connectors — users connect MetaMask via our
        // direct window.ethereum button instead, avoiding Web3Auth's SIWW flow
        // which requires domain whitelisting and chain support checks.
        [WALLET_CONNECTORS.WALLET_CONNECT_V2]: { label: 'WalletConnect', showOnModal: false },
        [WALLET_CONNECTORS.METAMASK]:          { label: 'MetaMask',      showOnModal: false },
        [WALLET_CONNECTORS.COINBASE]:          { label: 'Coinbase',      showOnModal: false },
      },
    },
  },
};

export default web3AuthContextConfig;
