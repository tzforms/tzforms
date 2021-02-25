import { BeaconWallet } from '@taquito/beacon-wallet';
import {
    ContractAbstraction,
    ContractProvider,
    TezosToolkit,
    Wallet
} from '@taquito/taquito';
import BigNumber from 'bignumber.js';
import React, {
    useEffect,
    useState
} from 'react';
import TzForm, { TzFormData } from '~components/TzForm';
import createWallet from '~utilities/createWallet';

let tezosRPC: string;
switch(TZFORMS_ENVIRONMENT) {
    case 'development':
        tezosRPC = 'https://api.tez.ie/rpc/delphinet';
        break;
    case 'production':
        tezosRPC = 'https://api.tez.ie/rpc/mainnet';
        break;
}

let wallet = createWallet();
const tezos = new TezosToolkit(tezosRPC);
tezos.setWalletProvider(wallet);

function Form(props: { contractAddress: string }) {
    const [tzFormId, setTzFormId] = useState<string>();
    const [tzFormFee, setTzFormFee] = useState<BigNumber>();
    const [tzFormData, setTzFormData] = useState<TzFormData>();

    const [contract, setContract] = useState<ContractAbstraction<Wallet>>();
    const [contractFetching, setContractFetching] = useState<boolean>(false);
    const [contractError, setContractError] = useState<string>();

    const [contractStorage, setContractStorage] = useState<any>();
    const [contractStorageFetching, setContractStorageFetching] = useState<boolean>(false);
    const [contractStorageError, setContractStorageError] = useState<string>();

    useEffect(() => {
        if (!contract && !contractFetching && !contractError) {
            setContractFetching(true);
            tezos.wallet.at(props.contractAddress)
                .then(value => setContract(value))
                .catch(() => setContractError('error'))
                .finally(() => setContractFetching(false));
        }

        if (contract && !contractStorage && !contractStorageFetching && !contractStorageError) {
            setContractStorageFetching(true);
            contract.storage()
                .then(value => setContractStorage(value))
                .catch(() => setContractStorageError('error'))
                .finally(() => setContractStorageFetching(false));
        }

        if (contractStorage && contractStorage['tzform_id'] && contractStorage['tzform_data'] && contractStorage['tzform_fee']) {
            try {
                setTzFormId(contractStorage['tzform_id'] as string);
                setTzFormFee(contractStorage['tzform_fee'] as BigNumber);
                setTzFormData(JSON.parse(contractStorage['tzform_data'].replace(/%22/g, '"')))
            } catch {}
        }
    }, [contract, contractStorage]);

    console.log(tzFormFee ? tzFormFee.toNumber() / 1000000 : undefined);

    return (
        <div>
            {contract && tzFormId && tzFormFee && tzFormData && (
                <TzForm
                    tezos={tezos}
                    wallet={wallet}
                    contract={contract}
                    id={tzFormId}
                    fee={tzFormFee.toNumber() / 1000000}
                    data={tzFormData}
                    afterSubmit={async () => {
                        
                    }}
                />
            )}
        </div>
    )
}

export default Form;