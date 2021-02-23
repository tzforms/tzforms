import { AccountInfo } from '@airgap/beacon-sdk';
import CaretLeftOutlined from '@ant-design/icons/LeftOutlined';
import CaretRightOutlined from '@ant-design/icons/RightOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import TrashOutlined from '@ant-design/icons/DeleteOutlined';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Col from 'antd/lib/col';
import Collapse from 'antd/lib/collapse';
import Divider from 'antd/lib/divider';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Layout from 'antd/lib/layout';
import Modal from 'antd/lib/modal';
import Row from 'antd/lib/row';
import Select from 'antd/lib/select';
import Space from 'antd/lib/space';
import Tabs from 'antd/lib/tabs';
import Typography from 'antd/lib/typography';
import React, {
    useContext,
    useEffect,
    useState
} from 'react';
import { parse } from 'qs';
import { v4 } from 'uuid';
import TzForm, {
    TzFormData,
    TzFormItem,
    TzFormSubmit
} from '~components/TzForm';
import BeaconContext from '~context/BeaconContext';
import TezosContext from '~context/TezosContext';
import tzformsApi, {
    CompileResponse
} from '~services/tzformsApi';
import OriginateStep from '~types/OriginateStep';
import BuilderOriginate from './Originate';
import { BuilderProps } from './Builder.types';

const generateCode = (owner: string, minMtzAmount: number, data: TzFormData) => {
    return `archetype tzform

// Your current connected wallet address
constant owner : address = @${owner}

// The minimum amount of required XTZ transferred to submit the form (0.1 XTZ)
constant min_submit_amount : tez = ${minMtzAmount}mtz

// Form-related data
variable tzform_id : string = "${v4()}"
variable tzform_data : string = "${JSON.stringify(data).replace(/\"/g, '%22')}"

// This asset will store information about each submission
asset tzform_submission identified by tzform_submission_id {
    tzform_submission_id : string;
    tzform_submission_owner : address;
    tzform_submission_amount : tez;${data.items.length > 0 ? '\n    ' : ''}${data.items.map(item => `tzform_submission_${item.name} : string;`).join('\n    ')}
}

// This is the entry used when the form is submitted
entry submit (
    p_tzform_submission_id : string${data.items.length > 0 ? ',\n    ' : ''}${data.items.map(item => `p_tzform_submission_${item.name} : string`).join(',\n    ')}
) {
    require {
        submit_c1 : transferred > min_submit_amount
    }

    effect {
        submission.add({
            submission_id = p_submission_id;
            submission_owner = caller;
            submission_amount = transferred;${data.items.length > 0 ? '\n    ' : ''}${data.items.map(item => `        submission_${item.name} = p_submission_${item.name}`).join(';\n    ')}
        });
    }
}

// This is how you will claim the XTZ sent to this contract
entry withdraw () {
    called by owner

    effect {
        transfer balance to owner;
    }
}
`;
}

function Builder(props: BuilderProps) {
    const tezos = useContext(TezosContext);
    const beacon = useContext(BeaconContext);

    const [siderCollapsed, setSiderCollapsed] = useState<boolean>();
    const [showOrginateModal, setShowOriginateModal] = useState<boolean>(false);
    const [hasResizeListener, setHasResizeListener] = useState<boolean>(false);
    function handleWindowResize() {
        if (!siderCollapsed && window.innerWidth <= 768) {
            setSiderCollapsed(true);
        }
    }

    const query = parse(props.location.search, { ignoreQueryPrefix: true });
    const template = query['template'];
    let initialTzFormSubmit: TzFormSubmit | undefined;
    let initialTzFormItems: { [id: string]: TzFormItem } = {};
    if (template) {
        switch (template) {
            case 'donation':
                initialTzFormSubmit = {
                    text: 'Donate',
                    block: true,
                    center: true,
                    round: true
                };
                initialTzFormItems = {
                    [v4()]: {
                        order: 1,
                        type: 'text',
                        label: 'Name',
                        name: 'name'
                    },
                    [v4()]: {
                        order: 2,
                        type: 'textarea',
                        label: 'Message',
                        name: 'message'
                    }
                };
                break;
        }
    }

    const [formSubmitButton] = Form.useForm<TzFormSubmit>();
    const [tzFormData, setTzFormData] = useState<{
        submit: TzFormSubmit;
        items: { [id: string]: TzFormItem }
    }>({
        submit: initialTzFormSubmit || {
            text: '',
            block: false,
            center: false,
            round: false
        },
        items: initialTzFormItems
    });
    const [tzFormDataActiveItemKey, setTzFormDataActiveItemKey] = useState<string>();

    const [walletActiveAccount, setWalletActiveAccount] = useState<AccountInfo>();
    const [walletActiveAccountFetching, setWalletActiveAccountFetching] = useState<boolean>(false);
    const [walletActiveAccountError, setWalletActiveAccountError] = useState<string>();

    const [code, setCode] = useState<string>();
    const [compileResponse, setCompileResponse] = useState<CompileResponse>();
    const [compileResponseFetching, setCompileResponseFetching] = useState<boolean>(false);
    const [compileResponseError, setCompileResponseError] = useState<string>();

    const [originateStep, setOriginateStep] = useState<OriginateStep>(OriginateStep.INITIALIZING);

    useEffect(() => {
        if (!hasResizeListener) {
            window.addEventListener('resize', handleWindowResize);
            setHasResizeListener(true);
        }

        return () => {
            if (hasResizeListener) {
                window.removeEventListener('resize', handleWindowResize);
                setHasResizeListener(false);
            }
        }
    });

    useEffect(() => {
        if (beacon) {
            if (!walletActiveAccount && !walletActiveAccountFetching && !walletActiveAccountError) {
                beacon.wallet.client.getActiveAccount()
                    .then(value => setWalletActiveAccount(value))
                    .catch(() => setWalletActiveAccountError('Failed to get active account.'))
                    .finally(() => setWalletActiveAccountFetching(false));
            }
        }

        if (!code && walletActiveAccount) {
            setCode(generateCode(walletActiveAccount.address, 100000, { submit: tzFormData.submit, items: Object.keys(tzFormData.items).map(id => tzFormData.items[id]) }));
        }
    }, [beacon, walletActiveAccount]);

    useEffect(() => {
        if (walletActiveAccount) {
            setCode(generateCode(walletActiveAccount.address, 100000, { submit: tzFormData.submit, items: Object.keys(tzFormData.items).map(id => tzFormData.items[id]) }));
        }
    }, [tzFormData])

    useEffect(() => {
        if (code && walletActiveAccount && !compileResponseFetching) {
            // check if code is valid first
            const isValid = Object.keys(tzFormData.items).map(id => tzFormData.items[id]).every(item => item.name.length > 0);
            if (isValid) {
                setCompileResponseError(undefined);
                setCompileResponseFetching(true);
                tzformsApi.compile(code)
                    .then(value => setCompileResponse(value))
                    .catch(reason => console.log(reason))
                    .finally(() => setCompileResponseFetching(false));
            }
        }
    }, [code]);

    return (
        <Layout
            className="tzf"
            hasSider={true}
            style={{ minHeight: 'calc(100vh - 66px)' }}
        >
            <Layout.Sider
                className="tzf-sider tzf-shadow"
                collapsed={siderCollapsed}
                collapsible={true}
                theme="light"
                trigger={null}
                style={{ transition: 'none' }}
                width={320}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                >
                    <div style={{ flexShrink: 1 }}>
                        <Button
                            block={true}
                            className="tzf-border"
                            size="large"
                            type="text"
                            onClick={() => setSiderCollapsed(!siderCollapsed)}
                        >
                            {siderCollapsed
                                ? <CaretRightOutlined />
                                : <CaretLeftOutlined />
                            }
                        </Button>
                    </div>
                    <div
                        className="tzf-pad tzf-border-right"
                        style={{ flexGrow: 1 }}
                    >
                        <Form
                            hidden={siderCollapsed}
                            form={formSubmitButton}
                            size="small"
                            labelCol={{
                                span: 24
                            }}
                            wrapperCol={{
                                span: 24
                            }}
                            onValuesChange={values => setTzFormData({
                                submit: {
                                    ...tzFormData.submit,
                                    ...values
                                },
                                items: tzFormData.items
                            })}
                        >
                            <Typography.Paragraph strong={true}>
                                Submit Button
                            </Typography.Paragraph>
                            <Form.Item
                                label="Text"
                                name="text"
                                initialValue={tzFormData.submit.text}
                            >
                                <Input placeholder="Submit" value={tzFormData.submit.text} />
                            </Form.Item>
                            <Space>
                                <Form.Item
                                    name="block"
                                    valuePropName="checked"
                                    initialValue={tzFormData.submit.block}
                                >
                                    <Checkbox value={tzFormData.submit.block}>Block</Checkbox>
                                </Form.Item>
                                <Form.Item
                                    name="center"
                                    valuePropName="checked"
                                    initialValue={tzFormData.submit.center}
                                >
                                    <Checkbox value={tzFormData.submit.center}>Center</Checkbox>
                                </Form.Item>
                                <Form.Item
                                    name="round"
                                    valuePropName="checked"
                                    initialValue={tzFormData.submit.round}
                                >
                                    <Checkbox value={tzFormData.submit.round}>Round</Checkbox>
                                </Form.Item>
                            </Space>
                            <Row>
                                <Col flex="auto">
                                    <Typography.Paragraph strong={true}>
                                        Form Items
                                    </Typography.Paragraph>
                                </Col>
                                <Col>
                                    <Button
                                        htmlType="button"
                                        type="ghost"
                                        onClick={() => {
                                            const orders = Object.keys(tzFormData.items).map(id => tzFormData.items[id].order);
                                            const nextOrder = Math.max(...orders);
                                            let items = tzFormData.items;
                                            items[v4()] = {
                                                order: nextOrder,
                                                type: 'text',
                                                label: '',
                                                name: ''
                                            };
                                            setTzFormData({
                                                submit: tzFormData.submit,
                                                items
                                            });
                                        }}
                                    >
                                        <Space>
                                            <span>Add</span>
                                            <PlusOutlined />
                                        </Space>
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                        <Form
                            hidden={siderCollapsed}
                            size="small"
                            labelCol={{
                                span: 24
                            }}
                            wrapperCol={{
                                span: 24
                            }}
                        >
                            <Collapse
                                bordered={true}
                                defaultActiveKey={tzFormDataActiveItemKey ? [tzFormDataActiveItemKey] : []}
                            >
                                {Object.keys(tzFormData.items).map((id, i) => {
                                    const item = tzFormData.items[id];

                                    return (
                                        <Collapse.Panel
                                            key={id}
                                            header={(
                                                <Row>
                                                    <Col flex="auto">
                                                        <Typography.Text strong={true}>
                                                            Item {i + 1}
                                                        </Typography.Text>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            danger={true}
                                                            type="link"
                                                            onClick={() => {
                                                                let items = tzFormData.items;
                                                                delete items[id];
                                                                setTzFormData({
                                                                    submit: tzFormData.submit,
                                                                    items
                                                                });
                                                            }}
                                                        >
                                                            <TrashOutlined />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            )}
                                        >
                                            <div>
                                                <Form.Item
                                                    label="Type"
                                                    name={`item:${id}.type`}
                                                    initialValue={item.type}
                                                >
                                                    <Select onChange={option => {
                                                        let items = tzFormData.items;
                                                        items[id].type = option as 'number' | 'text' | 'textarea';
                                                        setTzFormData({
                                                            submit: tzFormData.submit,
                                                            items
                                                        });
                                                        setTzFormDataActiveItemKey(id);
                                                    }}>
                                                        <Select.Option value="number">Number</Select.Option>
                                                        <Select.Option value="text">Text</Select.Option>
                                                        <Select.Option value="textarea">Textarea</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    label="Label"
                                                    name={`item:${id}.label`}
                                                    initialValue={item.label}
                                                >
                                                    <Input
                                                        type="text"
                                                        value={item.label || ''}
                                                        onInput={e => {
                                                            const value = e.currentTarget.value;
                                                            let items = tzFormData.items;
                                                            if (value.length > 0) items[id].label = value;
                                                            else delete items[id].label;
                                                            setTzFormData({
                                                                submit: tzFormData.submit,
                                                                items
                                                            });
                                                            setTzFormDataActiveItemKey(id);
                                                        }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    label="Name"
                                                    name={`item:${id}.name`}
                                                    initialValue={item.name}
                                                >
                                                    <Input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={e => {
                                                            const value = e.currentTarget.value;
                                                            let items = tzFormData.items;
                                                            items[id].name = value;
                                                            setTzFormData({
                                                                submit: tzFormData.submit,
                                                                items
                                                            });
                                                            setTzFormDataActiveItemKey(id);
                                                        }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name={`item:${id}.required`}
                                                    initialValue={item.required}
                                                    valuePropName="checked"
                                                >
                                                    <Checkbox
                                                        onChange={e => {
                                                            const value = e.target.checked;
                                                            let items = tzFormData.items;
                                                            items[id].required = value;
                                                            setTzFormData({
                                                                submit: tzFormData.submit,
                                                                items
                                                            });
                                                            setTzFormDataActiveItemKey(id);
                                                        }}
                                                    >
                                                        Required
                                                    </Checkbox>
                                                </Form.Item>
                                                {item.type !== 'number' && (
                                                    <Form.Item
                                                        label="Placeholder"
                                                        name={`item:${id}.placeholder`}
                                                        initialValue={item.placeholder}
                                                    >
                                                        <Input
                                                            type="text"
                                                            value={item.placeholder || ''}
                                                            onInput={e => {
                                                                const value = e.currentTarget.value;
                                                                let items = tzFormData.items;
                                                                if (value.length > 0) items[id].placeholder = value;
                                                                else delete items[id].placeholder;
                                                                setTzFormData({
                                                                    submit: tzFormData.submit,
                                                                    items
                                                                });
                                                                setTzFormDataActiveItemKey(id);
                                                            }}
                                                        />
                                                    </Form.Item>
                                                )}
                                                <Form.Item
                                                    label="Default value"
                                                    name={`item:${id}.defaultValue`}
                                                    initialValue={item.defaultValue}
                                                >
                                                    {item.type === 'number'
                                                        ? (
                                                            <InputNumber
                                                                style={{ width: '100%' }}
                                                                value={item.defaultValue ? parseFloat(item.defaultValue) : undefined}
                                                                onChange={value => {
                                                                    let items = tzFormData.items;
                                                                    if (value) items[id].defaultValue = value.toString();
                                                                    else delete items[id].defaultValue;
                                                                    setTzFormData({
                                                                        submit: tzFormData.submit,
                                                                        items
                                                                    });
                                                                    setTzFormDataActiveItemKey(id);
                                                                }}
                                                            />
                                                        )
                                                        : (
                                                            <Input
                                                                type="text"
                                                                onInput={e => {
                                                                    const value = e.currentTarget.value;
                                                                    let items = tzFormData.items;
                                                                    if (value.length > 0) items[id].defaultValue = value;
                                                                    else delete items[id].defaultValue;
                                                                    setTzFormData({
                                                                        submit: tzFormData.submit,
                                                                        items
                                                                    });
                                                                    setTzFormDataActiveItemKey(id);
                                                                }}
                                                            />
                                                        )
                                                    }
                                                </Form.Item>
                                            </div>
                                        </Collapse.Panel>
                                    );
                                })}
                            </Collapse>
                        </Form>
                    </div>
                </div>
            </Layout.Sider>
            <Layout.Content
                className="tzf-content"
            >
                <Row
                    style={{ width: '100%' }}
                    wrap={true}
                >
                    <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={12}
                        xl={12}
                    >
                        <div className="tzf-pad">
                            <Typography.Title
                                style={{
                                    fontWeight: 300
                                }}
                            >
                                Preview
                            </Typography.Title>
                            <Divider />
                            {tezos && beacon && (
                                <TzForm
                                    wallet={beacon.wallet}
                                    data={{ submit: tzFormData.submit, items: Object.keys(tzFormData.items).map(id => tzFormData.items[id]) }}
                                    preview={true}
                                />
                            )}
                        </div>
                    </Col>
                    <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={12}
                        xl={12}
                    >
                        <div className="tzf-pad">
                            <Typography.Title
                                style={{ fontWeight: 300 }}
                            >
                                Code
                            </Typography.Title>
                            <Divider />
                            {compileResponse && (
                                <Button
                                    onClick={() => setShowOriginateModal(true)}
                                >
                                    Originate
                                </Button>
                            )}
                            {code && (
                                <div>
                                    <Tabs>
                                        <Tabs.TabPane
                                            key="archetype"
                                            tab="Archetype"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                <code>
                                                    {code}
                                                </code>
                                            </pre>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane
                                            key="michelson"
                                            tab="Michelson"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                {compileResponse && !(compileResponse instanceof Error)
                                                    ? compileResponse['michelson'] instanceof Error
                                                        ? compileResponse['michelson'].message
                                                        : typeof compileResponse['michelson'] === 'string'
                                                            ? <code>{compileResponse['michelson']}</code>
                                                            : null
                                                    : null
                                                }
                                            </pre>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane
                                            key="michelson-storage"
                                            tab="Michelson Storage"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                {compileResponse && !(compileResponse instanceof Error)
                                                    ? compileResponse['michelson-storage'] instanceof Error
                                                        ? compileResponse['michelson-storage'].message
                                                        : typeof compileResponse['michelson-storage'] === 'string'
                                                            ? <code>{compileResponse['michelson-storage']}</code>
                                                            : null
                                                    : null
                                                }
                                            </pre>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane
                                            key="markdown"
                                            tab="Markdown"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                {compileResponse && !(compileResponse instanceof Error)
                                                    ? compileResponse['markdown'] instanceof Error
                                                        ? compileResponse['markdown'].message
                                                        : typeof compileResponse['markdown'] === 'string'
                                                            ? <code>{compileResponse['markdown']}</code>
                                                            : null
                                                    : null
                                                }
                                            </pre>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane
                                            key="ligo"
                                            tab="LIGO"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                {compileResponse && !(compileResponse instanceof Error)
                                                    ? compileResponse['ligo'] instanceof Error
                                                        ? compileResponse['ligo'].message
                                                        : typeof compileResponse['ligo'] === 'string'
                                                            ? <code>{compileResponse['ligo']}</code>
                                                            : null
                                                    : null
                                                }
                                            </pre>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane
                                            key="smartpy"
                                            tab="SmartPy"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                {compileResponse && !(compileResponse instanceof Error)
                                                    ? compileResponse['smartpy'] instanceof Error
                                                        ? compileResponse['smartpy'].message
                                                        : typeof compileResponse['smartpy'] === 'string'
                                                            ? <code>{compileResponse['smartpy']}</code>
                                                            : null
                                                    : null
                                                }
                                            </pre>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane
                                            key="whyml"
                                            tab="WhyML"
                                        >
                                            <pre
                                                style={{
                                                    background: '#333333',
                                                    color: '#ffffff',
                                                    padding: '10px'
                                                }}
                                            >
                                                {compileResponse && !(compileResponse instanceof Error)
                                                    ? compileResponse['whyml'] instanceof Error
                                                        ? compileResponse['whyml'].message
                                                        : typeof compileResponse['whyml'] === 'string'
                                                            ? <code>{compileResponse['whyml']}</code>
                                                            : null
                                                    : null
                                                }
                                            </pre>
                                        </Tabs.TabPane>
                                    </Tabs>

                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
                <Modal
                    destroyOnClose={true}
                    okButtonProps={{
                        hidden: true
                    }}
                    visible={showOrginateModal}
                    width={1200}
                    onCancel={() => {
                        setShowOriginateModal(false);
                        setOriginateStep(OriginateStep.INITIALIZING);
                    }}
                >
                    {tezos && compileResponse && !(compileResponse instanceof Error) && !(compileResponse['michelson'] instanceof Error) && !(compileResponse['michelson-storage'] instanceof Error) && (
                        <BuilderOriginate
                            michelson={compileResponse['michelson']}
                            michelsonStorage={compileResponse['michelson-storage']}
                            visible={showOrginateModal}
                            step={originateStep}
                            onStepUpdate={step => setOriginateStep(step)}
                        />
                    )}
                </Modal>
            </Layout.Content>
        </Layout>
    );
}

export default Builder;