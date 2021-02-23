import { defaultEventCallbacks } from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';

function createWallet() {
    return new BeaconWallet({
        name: 'tzforms',
        disableDefaultEvents: true,
        eventHandlers: {
            PAIR_INIT: {
                handler: defaultEventCallbacks.PAIR_INIT
            },
            PAIR_SUCCESS: {
                handler: defaultEventCallbacks.PAIR_SUCCESS
            }
        }
    });
}

export default createWallet;