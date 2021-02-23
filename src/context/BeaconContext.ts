import { BeaconWallet } from '@taquito/beacon-wallet';
import { createContext } from 'react';

const BeaconContext = createContext<{
    wallet: BeaconWallet;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
} | undefined>(undefined);

export default BeaconContext;