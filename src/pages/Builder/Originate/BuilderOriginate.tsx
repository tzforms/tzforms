import { Estimate } from '@taquito/taquito/dist/types/contract/estimate';
import React, {
    useContext,
    useEffect,
    useState
} from 'react';
import BeaconContext from '~context/BeaconContext';
import TezosContext from '~context/TezosContext';
import { BuilderOriginateProps } from './BuilderOriginate.types';

function BuilderOriginate(props: BuilderOriginateProps) {
    const tezos = useContext(TezosContext);
    const beacon = useContext(BeaconContext);

    const [estimate, setEstimate] = useState<Estimate>();
    const [estimateFetching, setEstimateFetching] = useState<boolean>(false);
    const [estimateError, setEstimateError] = useState<string>();

    useEffect(() => {
        if (tezos && beacon) {
            if (!estimate && !estimateFetching && !estimateError) {
                setEstimateFetching(true);
                tezos.estimate.originate({
                    code: props.michelson,
                    init: props.michelsonStorage
                })
                    .then(value => setEstimate(value))
                    .catch(reason => {
                        console.log(reason);
                        setEstimateError(reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'Failed to get estimate')
                    })
                    .finally(() => setEstimateFetching(false));
            }
        }
    }, [tezos])

    return (
        <div>
            {JSON.stringify(estimate)}
            {estimateError}
        </div>
    );
}

export default BuilderOriginate;