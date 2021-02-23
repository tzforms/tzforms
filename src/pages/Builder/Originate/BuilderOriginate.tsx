import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import { OriginationOperation } from '@taquito/taquito/dist/types/operations/origination-operation';
import { Estimate } from '@taquito/taquito/dist/types/contract/estimate';
import Modal from 'antd/lib/modal';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import Typography from 'antd/lib/typography';
import React, {
    Fragment,
    useContext,
    useEffect,
    useState
} from 'react';
import TezosContext from '~context/TezosContext';
import OriginateStep from '~types/OriginateStep';
import { BuilderOriginateProps } from './BuilderOriginate.types';
import Button from 'antd/lib/button';
import { Link } from 'react-router-dom';

const tableColumns = [
    {
        title: 'Gas limit',
        dataIndex: 'gasLimit',
        key: 'gasLimit'
    },
    {
        title: 'Consumed gas',
        dataIndex: 'consumedGas',
        key: 'consumedGas'
    },
    {
        title: 'Storage limit',
        dataIndex: 'storageLimit',
        key: 'storageLimit'
    },
    {
        title: 'Burn fee',
        dataIndex: 'burnFee',
        key: 'burnFee'
    },
    {
        title: 'Minimal fee',
        dataIndex: 'minimalFee',
        key: 'minimalFee'
    },
    {
        title: 'Suggested fee',
        dataIndex: 'suggestedFee',
        key: 'suggestedFee'
    },
    {
        title: 'Using base fee',
        dataIndex: 'usingBaseFee',
        key: 'usingBaseFee'
    },
    {
        title: 'Total cost',
        dataIndex: 'totalCost',
        key: 'totalCost'
    }
]

function BuilderOriginate(props: BuilderOriginateProps) {
    const tezos = useContext(TezosContext);

    const [pkh, setPkh] = useState<string>();
    const [pkhFetching, setPkhFetching] = useState<boolean>(false);
    const [pkhError, setPkhError] = useState<string>();

    const [estimate, setEstimate] = useState<Estimate>();
    const [estimateFetching, setEstimateFetching] = useState<boolean>(false);
    const [estimateError, setEstimateError] = useState<string>();

    const [originationOperation, setOriginationOperation] = useState<OriginationOperation>();
    const [originationOperationFetching, setOriginationOperationFetching] = useState<boolean>(false);
    const [originationOperationError, setOriginationOperationError] = useState<string>();

    const [confirmed, setConfirmed] = useState<boolean>(false);
    const [confirmedFetching, setConfirmedFetching] = useState<boolean>(false);
    const [confirmedError, setConfirmedError] = useState<string>();

    function initialize() {
        if (tezos && props.step === OriginateStep.INITIALIZING && !pkhFetching && !pkhError) {
            setPkhFetching(true);
            tezos.signer.publicKeyHash()
                .then(_pkh => {
                    setPkh(_pkh);
                    props.onStepUpdate(OriginateStep.ESTIMATING);
                })
                .catch(reason => {
                    console.log(reason);
                    let error: string;
                    if (reason instanceof Error) error = reason.message;
                    else if (typeof reason === 'string') error = reason;
                    else error = 'Initialization failed';
                    setPkhError(error);
                    props.onStepUpdate(OriginateStep.FAILED);
                })
                .finally(() => setPkhFetching(false));
        }
    }

    function estimateContract() {
        if (tezos && props.step === OriginateStep.ESTIMATING && !estimateFetching && !estimateError) {
            setEstimateFetching(true);
            tezos.estimate.originate({
                code: props.michelson,
                init: props.michelsonStorage
            })
                .then(value => setEstimate(value))
                .catch(reason => {
                    console.log(reason);
                    let error: string;
                    if (reason instanceof Error) error = reason.message;
                    else if (typeof reason === 'string') error = reason;
                    else error = 'Contract estimation failed';
                    setEstimateError(error);
                    props.onStepUpdate(OriginateStep.FAILED);
                })
                .finally(() => setEstimateFetching(false));
        }
    }

    function originateContract() {
        if (tezos && props.step === OriginateStep.ORIGINATING && !originationOperationFetching && !originationOperationError) {
            setOriginationOperationFetching(true);
            tezos.contract.originate({
                code: props.michelson,
                init: props.michelsonStorage
            })
                .then(value => {
                    setOriginationOperation(value);
                    props.onStepUpdate(OriginateStep.CONFIRMING);
                })
                .catch(reason => {
                    let error: string;
                    if (reason instanceof Error) error = reason.message;
                    else if (typeof reason === 'string') error = reason;
                    else error = 'Contract origination failed';
                    setOriginationOperationError(error);
                    props.onStepUpdate(OriginateStep.FAILED);
                })
                .finally(() => setOriginationOperationFetching(false))
        }
    }

    function confirmContract() {
        if (tezos && props.step === OriginateStep.CONFIRMING && originationOperation && !confirmed && !confirmedFetching && !confirmedError) {
            setConfirmedFetching(true);
            originationOperation.confirmation()
                .then(() => {
                    setConfirmed(true);
                    props.onStepUpdate(OriginateStep.CONFIRMED)
                })
                .catch(reason => {
                    let error: string;
                    if (reason instanceof Error) error = reason.message;
                    else if (typeof reason === 'string') error = reason;
                    else error = 'Contract confirmation unknown';
                    setConfirmedError(error);
                    props.onStepUpdate(OriginateStep.FAILED);
                })
                .finally(() => setConfirmedFetching(false));
        }
    }

    useEffect(() => {
        if (tezos) {
            if (props.step === OriginateStep.INITIALIZING
                && !pkhFetching && !pkhError
            ) initialize();

            if (props.step === OriginateStep.ESTIMATING
                && !estimateFetching && !estimateError
            ) estimateContract();

            if (props.step === OriginateStep.ORIGINATING
                && !originationOperationFetching && !originationOperationError
            ) originateContract();

            if (props.step === OriginateStep.CONFIRMING
                && originationOperation && !confirmedFetching && !confirmedError
            ) confirmContract();
        }
        if (props.onStepUpdate) props.onStepUpdate(props.step);
    }, [props.step]);

    let timelinePendingText: string | undefined = undefined;
    if (pkhFetching || estimateFetching || originationOperationFetching || confirmedFetching) {
        if (pkhFetching) timelinePendingText = 'Initializing...';
        if (estimateFetching) timelinePendingText = 'Estimating costs...';
        if (originationOperationFetching) timelinePendingText = 'Originating contract...';
        if (confirmedFetching) timelinePendingText = 'Confirming origination, this may take a while...';
    }

    return (
        <div>
            <Table
                columns={tableColumns}
                dataSource={estimate ? [{
                    key: 1,
                    gasLimit: estimate.gasLimit,
                    consumedGas: estimate.consumedMilligas / 1000,
                    storageLimit: estimate.storageLimit,
                    burnFee: `${estimate.burnFeeMutez}mꜩ`,
                    minimalFee: `${estimate.minimalFeeMutez}mꜩ`,
                    suggestedFee: `${estimate.suggestedFeeMutez}mꜩ`,
                    usingBaseFee: `${estimate.usingBaseFeeMutez}mꜩ`,
                    totalCost: `${estimate.totalCost / 1000000}ꜩ`
                }] : undefined}
                loading={estimateFetching}
                pagination={false}
                style={{ marginBottom: '24px' }}
            />
            <Timeline
                pending={timelinePendingText}
            >
                {(pkh || pkhError) && (
                    <Timeline.Item color={pkhError ? 'red' : undefined}>
                        {pkh && 'Initialized'}
                        {pkhError}
                    </Timeline.Item>
                )}
                {(estimate || estimateError) && (
                    <Timeline.Item color={estimateError ? 'red' : undefined}>
                        {estimate && 'Estimate retrieved'}
                        {estimateError}
                    </Timeline.Item>
                )}
                {(originationOperation || originationOperationError) && (
                    <Timeline.Item color={originationOperationError ? 'red' : undefined}>
                        {originationOperation && <Fragment>
                            Contract originated at <Typography.Text copyable={true}>{originationOperation.contractAddress}</Typography.Text>
                        </Fragment>}
                        {originationOperationError}
                    </Timeline.Item>
                )}
                {(confirmed || confirmedError) && (
                    <Timeline.Item dot={!confirmedError && <CheckCircleFilled />} color={confirmedError ? 'red' : 'green'}>
                        {confirmed && 'Origination confirmed'}
                        {confirmedError}
                    </Timeline.Item>
                )}
            </Timeline>
            {props.step === OriginateStep.ESTIMATING && estimate && (
                <Button
                    type="primary"
                    onClick={() => props.onStepUpdate(OriginateStep.ORIGINATING)}
                >
                    Originate
                </Button>
            )}
            {props.step === OriginateStep.ORIGINATING && (
                <Typography.Paragraph>
                    Contract origination request initiated via TezBridge, check your TezBridge window if it doesn't open automatically.
                </Typography.Paragraph>
            )}
            {props.step === OriginateStep.CONFIRMING && (
                <Typography.Paragraph>
                    Your contract is currently being confirmed by the network. Please be patient.
                </Typography.Paragraph>
            )}
            {props.step === OriginateStep.CONFIRMED && originationOperation && confirmed && (
                <Typography.Paragraph>
                    Your contract has been originated. You can view your deployed form at <Typography.Link 
                        copyable={true} 
                        href={`${TZFORMS_ENVIRONMENT === 'development' ? 'http://localhost:8080' : 'https://form.tzforms.com'}/${originationOperation.contractAddress}`}
                    >
                        {TZFORMS_ENVIRONMENT === 'development' ? 'http://localhost:8080' : 'https://form.tzforms.com'}/{originationOperation.contractAddress}
                    </Typography.Link>. View our <Link to="/articles/embed-your-form">article</Link> on how to embed the form in your website.
                </Typography.Paragraph>
            )}
        </div>
    );
}

export default BuilderOriginate;