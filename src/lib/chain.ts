// Celo mainnet contract addresses
export const WORDZAPPER_CONTRACT =
  '0x55B0deCde002BD3BEfcac83556ca10AbB82af0b9' as const;

export const G$_TOKEN =
  '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A' as const;

export const IDENTITY_CONTRACT =
  '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42' as const;

export const WORDZAPPER_ABI = [
  {
    name: 'claimReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'score', type: 'uint64' },
      { name: 'tier',  type: 'uint8'  },
    ],
    outputs: [],
  },
  {
    name: 'hasPlayedToday',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'poolBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'remainingTodayCap',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export const IDENTITY_ABI = [
  {
    name: 'isWhitelisted',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
] as const;

// GoodDollar face-verification URL — open in new tab
export const GOODDOLLAR_VERIFY_URL = 'https://goodapp.org/#/face-verification';
