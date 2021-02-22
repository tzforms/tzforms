import {
    defaultEventCallbacks,
    Network,
    NetworkType
} from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import ConfigProvider from 'antd/lib/config-provider';
import Layout from 'antd/lib/layout';
import enUS from 'antd/lib/locale/en_US';
import message from 'antd/lib/message';
import React, {
    lazy,
    Suspense,
    useState
} from 'react';
import {
    BrowserRouter,
    Route,
    Switch
} from 'react-router-dom';
import Footer from '~components/Footer';
import Header from '~components/Header';
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
            >
                <TezosContext.Provider value={tezos}>
                    <BeaconContext.Provider value={{
                        wallet,
                        connect: async () => {
                            if (tezos) {
                                const wallet = new BeaconWallet({
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
                                await wallet.requestPermissions({
                                    network: tezosNetwork
                                });
                                message.success('Wallet connected.');
                                setWallet(wallet);
                                tezos.setWalletProvider(wallet);
                            }
                        },
                        disconnect: async () => {
                            if (wallet) {
                                await wallet.disconnect();
                                message.info('Wallet disconnected.');
                                setWallet(undefined);
                            }
                        }
                    }}>
                        <Layout className="tzf">
                            <Header className="tzf-header" />
                            <Layout.Content className="tzf-content">
                                <Suspense fallback="Loading...">
                                    <Switch>
                                        <Route exact={true} path="/" component={Home} />
                                    </Switch>
                                </Suspense>
                            </Layout.Content>
                            <Footer className="tzf-footer" />
                        </Layout>
                    </BeaconContext.Provider>
                </TezosContext.Provider>
            </ConfigProvider>
        </BrowserRouter>
    );
}

export default App;