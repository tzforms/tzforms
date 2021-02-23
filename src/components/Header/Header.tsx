import {
    AccountInfo,
    TransportStatus
} from '@airgap/beacon-sdk';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import Typography from 'antd/lib/typography';
import React, {
    Fragment,
    useContext,
    useEffect,
    useState
} from 'react';
import { withRouter } from 'react-router-dom';
import tzformsNoSpaceWebp from '~assets/images/tzforms_no_space.webp';
import TezosContext from '~context/TezosContext';
import BeaconContext from '~context/BeaconContext';
import sleep from '~utilities/sleep';
import { HeaderProps } from './Header.types';

function Header(props: HeaderProps) {
    const tezos = useContext(TezosContext);
    const beacon = useContext(BeaconContext);

    const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
    const [disconnectingWallet, setDisconnectingWallet] = useState<boolean>(false);

    const [walletActiveAccount, setWalletActiveAccount] = useState<AccountInfo>();
    const [walletActiveAccountFetching, setWalletActiveAccountFetching] = useState<boolean>(false);
    const [walletActiveAccountError, setWalletActiveAccountError] = useState<string>();

    const [walletMenuVisible, setWalletMenuVisible] = useState<boolean>(false);

    function initWalletActiveAccount() {
        if (beacon && !walletActiveAccount && !walletActiveAccountFetching && !walletActiveAccountError) {
            beacon.wallet.client.getActiveAccount()
                .then(value => setWalletActiveAccount(value))
                .catch(() => setWalletActiveAccountError('Failed to get active account.'))
                .finally(() => setWalletActiveAccountFetching(false));
        }
    }

    useEffect(() => {
        if (!connectingWallet) {
            initWalletActiveAccount();
        }
    }, [connectingWallet]);

    const connectButton = () => (
        <Button
            className="tzf-shadow-dark tzf-border-none"
            disabled={!beacon}
            loading={connectingWallet}
            shape="round"
            size="large"
            type="ghost"
            onClick={async () => {
                if (beacon) {
                    setConnectingWallet(true);
                    try {
                        await beacon.connect();
                    } catch { }
                    setConnectingWallet(false);
                }
            }}
        >
            {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
        </Button>
    );

    const disconnectButton = () => (
        <Dropdown
            disabled={!beacon}
            overlay={(
                <Menu
                    onClick={e => {
                        if (e.key !== 'disconnect-wallet') setWalletMenuVisible(false);
                    }}
                >
                    <Menu.Item
                        disabled={disconnectingWallet}
                        key="disconnect-wallet"
                        onClick={async () => {
                            if (beacon) {
                                setDisconnectingWallet(true);
                                await sleep(1000);
                                await beacon.disconnect();
                                setWalletActiveAccount(undefined);
                                setDisconnectingWallet(false);
                                setWalletMenuVisible(false);
                            }
                        }}
                    >
                        Disconnect Wallet
                    </Menu.Item>
                </Menu>
            )}
            visible={walletMenuVisible}
            onVisibleChange={flag => setWalletMenuVisible(flag)}
        >
            <Button
                className="tzf-shadow-dark tzf-border-none"
                shape="round"
                size="large"
                type="ghost"
            >
                {beacon && walletActiveAccount && (
                    <Fragment>
                        <Typography.Text
                            strong={true}
                            style={{
                                fontSize: '2.5rem',
                                lineHeight: '1rem',
                                marginRight: '8px',
                                verticalAlign: '-0.45rem'
                            }}
                            type="success"
                        >
                            &middot;
                        </Typography.Text>
                        <Typography.Text
                            style={{
                                fontSize: '0.85rem',
                                marginRight: '8px'
                            }}
                            type="secondary"
                        >
                            {walletActiveAccount.address.substr(0, 4)}
                            ...
                            {walletActiveAccount.address.substr(walletActiveAccount.address.length - 4, walletActiveAccount.address.length)}
                        </Typography.Text>
                    </Fragment>
                )}
            </Button>
        </Dropdown>
    );

    const route = props.location.pathname.match(/([^\/]*)\/*$/);

    return (
        <Layout.Header className={props.className}>
            <div className="tzf-shadow-light">
                <div className="tzf-container tzf-pad-x">
                    <Menu
                        mode="horizontal"
                        selectedKeys={route ? [route[1]] : []}
                        style={{ borderBottom: 'none' }}
                        theme="light"
                    >
                        <Menu.Item
                            key="brand"
                            style={{
                                borderBottom: 'none',
                                marginLeft: '0',
                                marginRight: '0'
                            }}
                            onClick={() => window.location.href = '/'}
                        >
                            <img
                                height={24}
                                src={tzformsNoSpaceWebp}
                                style={{
                                    position: 'relative',
                                    top: '-1px'
                                }}
                            />
                        </Menu.Item>
                        <Menu.Item
                            key="wallet"
                            style={{
                                borderBottom: 'none',
                                cursor: 'default',
                                float: 'right',
                                marginRight: '0'
                            }}
                        >
                            {beacon && (
                                !walletActiveAccount
                                    ? connectButton() 
                                    : disconnectButton()
                            )}
                        </Menu.Item>
                        <Menu.Item
                            key="builder"
                            style={{
                                borderBottom: 'none',
                                float: 'right'
                            }}
                            onClick={() => {
                                if (route) {
                                    if (!route[1].includes('builder')) props.history.push('/builder');
                                } else props.history.push('/builder');
                            }}
                        >
                            Builder
                        </Menu.Item>
                        <Menu.Item
                            key="templates"
                            style={{
                                borderBottom: 'none',
                                float: 'right'
                            }}
                            onClick={() => props.history.push('/templates')}
                        >
                            Templates
                        </Menu.Item>
                    </Menu>
                </div>
            </div>
        </Layout.Header>
    );
}

export default withRouter(Header);