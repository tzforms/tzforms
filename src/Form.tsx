import {
    ContractAbstraction,
    ContractProvider,
    TezosToolkit
} from '@taquito/taquito';
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

const wallet = createWallet();
const tezos = new TezosToolkit(tezosRPC);
tezos.setWalletProvider(wallet);

function Form(props: { contractAddress: string }) {
    const [tzFormId, setTzFormId] = useState<string>();
    const [tzFormData, setTzFormData] = useState<TzFormData>();

    const [contract, setContract] = useState<ContractAbstraction<ContractProvider>>();
    const [contractFetching, setContractFetching] = useState<boolean>(false);
    const [contractError, setContractError] = useState<string>();

    const [contractStorage, setContractStorage] = useState<any>();
    const [contractStorageFetching, setContractStorageFetching] = useState<boolean>(false);
    const [contractStorageError, setContractStorageError] = useState<string>();

    useEffect(() => {
        if (!contract && !contractFetching && !contractError) {
            setContractFetching(true);
            tezos.contract.at(props.contractAddress)
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

        if (contractStorage && contractStorage['tzform_id'] && contractStorage['tzform_data']) {
            try {
                setTzFormId(contractStorage['tzform_id'] as string);
                setTzFormData(JSON.parse(contractStorage['tzform_data'].replace(/%22/g, '"')))
            } catch {}
        }
    }, [contract, contractStorage])

    return (
        <div>
            {tzFormData && (
                <TzForm
                    wallet={wallet}
                    data={tzFormData} 
                />
            )}
        </div>
    )
}

export default Form;