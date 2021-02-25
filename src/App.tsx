import {
    Network,
    NetworkType,
    PermissionScope
} from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { TezBridgeSigner } from '@taquito/tezbridge-signer';
import ConfigProvider from 'antd/lib/config-provider';
import Layout from 'antd/lib/layout';
import enUS from 'antd/lib/locale/en_US';
import message from 'antd/lib/message';
import React, {
    lazy,
    Suspense
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
import createWallet from '~utilities/createWallet';

const Home = lazy(() => import('./pages/Home'));
const Builder = lazy(() => import('./pages/Builder'));
const Templates = lazy(() => import('./pages/Templates'));

let tezosRPC: string;
let tezosNetwork: Network;
switch(TZFORMS_ENVIRONMENT) {
    case 'development':
        tezosNetwork = { type: NetworkType.DELPHINET };
        tezosRPC = 'https://api.tez.ie/rpc/delphinet';
        break;
    case 'production':
        tezosNetwork = { type: NetworkType.MAINNET };
        tezosRPC = 'https://api.tez.ie/rpc/mainnet';
        break;
}

const tezos = new TezosToolkit(tezosRPC);
let wallet = createWallet();
tezos.setProvider({
    wallet,
    signer: new TezBridgeSigner()
});

function App() {
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
                                await wallet.requestPermissions({
                                    network: tezosNetwork,
                                    scopes: [PermissionScope.OPERATION_REQUEST, PermissionScope.SIGN]
                                });
                                message.success('Wallet connected.');
                            }
                        },
                        disconnect: async () => {
                            if (tezos && wallet) {
                                await wallet.disconnect();
                                wallet = createWallet();
                                tezos.setWalletProvider(wallet);
                                message.info('Wallet disconnected.');
                            }
                        }
                    }}>
                        <Layout className="tzf">
                            <Header className="tzf-header" />
                            <Layout.Content className="tzf-content">
                                <Suspense fallback="Loading...">
                                    <Switch>
                                        <Route exact={true} path="/" component={Home} />
                                        <Route exact={true} path="/builder" component={Builder} />
                                        <Route exact={true} path="/templates" component={Templates} />
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