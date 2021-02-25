import { BeaconWallet } from '@taquito/beacon-wallet';
import {
    ContractAbstraction,
    TezosToolkit,
    Wallet
} from '@taquito/taquito';

export interface TzFormSubmit {
    text: string;
    block: boolean;
    center: boolean;
    round: boolean;
}

export interface TzFormItem {
    order: number;
    type: 'number' | 'text' | 'textarea';
    label?: string;
    name: string;
    required?: boolean;
    placeholder?: string;
}

export interface TzFormData {
    submit: TzFormSubmit;
    items: TzFormItem[];
}

export interface TzFormProps {
    tezos: TezosToolkit;
    wallet: BeaconWallet;
    contract?: ContractAbstraction<Wallet>;
    id: string;
    fee: number;
    data: TzFormData;
    preview?: boolean;
    afterSubmit?: () => void;
}

export interface TzFormValues {
    [name: string]: number | string;
}