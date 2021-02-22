import {
    Network,
    NetworkType
} from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import ConfigProvider from 'antd/lib/config-provider';
import Layout from 'antd/lib/layout';
import enUS from 'antd/lib/locale/en_US';
import React, {
    lazy,
    Suspense,
    useState
} from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import TezosContext from '~context/TezosContext';
import BeaconContext from '~context/BeaconContext';

const Home = lazy(() => import('./pages/Home'));

let tezosRPC: string;
let tezosNetwork: Network;
switch(ENVIRONMENT) {
    case 'development':
        tezosNetwork = { type: NetworkType.DELPHINET };
        tezosRPC = 'https://mainnet-tezos.giganode.io';
        break;
    case 'production':
        tezosNetwork = { type: NetworkType.MAINNET };
        tezosRPC = 'https://testnet-tezos.giganode.io';
        break;
}

function App() {
    const tezos = new TezosToolkit(tezosRPC);
    const [wallet, setWallet] = useState<BeaconWallet>();

    return (
        <BrowserRouter>
            <ConfigProvider
                locale={enUS}
                pageHeader={{ ghost: true }}
                prefixCls="tzf"
            >
                <TezosContext.Provider value={tezos}>
                    <BeaconContext.Provider value={{
                        wallet,
                        connect: async () => {
                            const wallet = new BeaconWallet({
                                name: 'tzforms'
                            });
                            try {
                                await wallet.requestPermissions({
                                    network: tezosNetwork
                                });
                                setWallet(wallet);
                            } catch {}
                        },
                        disconnect: async () => {
                            if (wallet) {
                                await wallet.disconnect();
                                setWallet(undefined);
                            }
                        }
                    }}>
                        <Suspense fallback="Loading...">
                            <Switch>
                                <Route exact={true} path="/" component={Home} />
                            </Switch>
                        </Suspense>
                    </BeaconContext.Provider>
                </TezosContext.Provider>
            </ConfigProvider>
        </BrowserRouter>
    );
}

export default App;