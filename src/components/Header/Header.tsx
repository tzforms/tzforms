import { AccountInfo } from '@airgap/beacon-sdk';
import Button from 'antd/lib/button';
import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import Space from 'antd/lib/space';
import React, {
    useContext,
    useEffect,
    useState
} from 'react';
import TezosContext from '~context/TezosContext';
import BeaconContext from '~context/BeaconContext';

function Header() {
    const tezos = useContext(TezosContext);
    const beacon = useContext(BeaconContext);

    const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
    const [disconnectingWallet, setDisconnectingWallet] = useState<boolean>(false);
    const [walletActiveAccount, setWalletActiveAccount] = useState<AccountInfo>();
    const [walletActiveAccountFetching, setWalletActiveAccountFetching] = useState<boolean>(false);
    const [walletActiveAccountError, setWalletActiveAccountError] = useState<string>();

    useEffect(() => {
        if (beacon.wallet) {
            if (!walletActiveAccount && !walletActiveAccountFetching && !walletActiveAccountError) {
                beacon.wallet.client.getActiveAccount()
                    .then(value => setWalletActiveAccount(value))
                    .catch(reason => setWalletActiveAccountError('Failed to get active account.'))
                    .finally(() => setWalletActiveAccountFetching(false));
            }
        }
    }, [beacon.wallet])

    return (
        <Layout.Header style={{ background: '#ffffff', padding: '0' }}>
            <Menu
                selectedKeys={[]}
                mode="horizontal"
                theme="light"
            >
                <Menu.Item
                    style={{ borderBottom: 'none' }}
                >
                    tzforms
                </Menu.Item>
                <Menu.Item style={{ borderBottom: 'none', cursor: 'default', float: 'right' }}>
                    {beacon.wallet ? (
                        <Space>
                            <Button
                                disabled={!beacon.disconnect}
                                loading={disconnectingWallet}
                                onClick={async () => {
                                    if (beacon.disconnect) {
                                        setDisconnectingWallet(true);
                                        await beacon.disconnect();
                                        setDisconnectingWallet(false);
                                    }
                                }}
                            >
                                Disconnect
                            </Button>
                        </Space>
                    ) : (
                        <Button
                            disabled={!beacon.connect}
                            loading={connectingWallet}
                            onClick={async () => {
                                if (beacon.connect) {
                                    setConnectingWallet(true);
                                    await beacon.connect();
                                    setConnectingWallet(false);
                                }
                            }}
                        >
                            Connect Wallet
                        </Button>
                    )}
                </Menu.Item>
            </Menu>
        </Layout.Header>
    );
}

export default Header;