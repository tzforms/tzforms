import { TezosToolkit } from '@taquito/taquito';
import { createContext } from 'react';

const TezosContext = createContext<TezosToolkit | undefined>(undefined);

export default TezosContext;