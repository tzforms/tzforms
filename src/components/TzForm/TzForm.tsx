import { NetworkType } from '@airgap/beacon-sdk';
import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Form, { Rule } from 'antd/lib/form';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Item from 'antd/lib/list/Item';
import Row from 'antd/lib/row';
import React, {
    useState
} from 'react';
import { v4 } from 'uuid';
import {
    TzFormItem,
    TzFormProps,
    TzFormValues
} from './TzForm.types';

function renderTzFormItem(item: TzFormItem, isPreview: boolean) {
    switch (item.type) {
        case 'number':
            return <InputNumber style={{ width: '100%' }} readOnly={isPreview} />;
        case 'text':
            return <Input placeholder={item.placeholder} readOnly={isPreview} />;
        case 'textarea':
            return <Input.TextArea placeholder={item.placeholder} readOnly={isPreview} />;
    }
}

function TzForm(props: TzFormProps) {
    const [form] = Form.useForm<TzFormValues>();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [confirming, setConfirming] = useState<boolean>(false);

    let isPreview: boolean;
    if (props.preview) isPreview = props.preview;
    else isPreview = false;

    return (
        <Form
            form={form}
            colon={false}
            requiredMark="optional"
            labelCol={{
                span: 24
            }}
            wrapperCol={{
                span: 24
            }}
            onFinish={async values => {
                const sendAmount = values['sendAmount'] as number;
                const valuesToMethodArgs: (string | number)[] = [v4()];
                Object.keys(values).forEach(key => {
                    if (key !== 'sendAmount') valuesToMethodArgs.push(values[key] || '');
                });

                if (!isPreview && props.contract && !submitting) {
                    setSubmitting(true);
                    try {
                        await props.wallet.client.requestPermissions({
                            network: { type: TZFORMS_ENVIRONMENT === 'development' ? NetworkType.DELPHINET : NetworkType.MAINNET }
                        });
                        const op = await props.contract.methods.submit(...valuesToMethodArgs).send({
                            amount: sendAmount
                        });
                        console.log(op);
                        setConfirming(true);
                        const confirmation = await op.confirmation();
                        console.log(confirmation);
                    } catch (e) {
                        console.log(e);
                    } finally {
                        setSubmitting(false);
                        setConfirming(false);
                        if (props.afterSubmit) props.afterSubmit();
                    }
                }
            }}
        >
            {props.data.items.map((item, i) => {
                const rules: Rule[] = [];
                if (item.required) rules.push({
                    required: true,
                    message: `${item.label || item.name.charAt(0).toUpperCase() + item.name.substr(1, item.name.length)} is required.`
                });

                return (
                    <Form.Item
                        key={`form-item-${i}`}
                        label={item.label}
                        name={item.name}
                        required={item.required}
                        rules={rules}
                        validateTrigger="onBlur"
                    >
                        {renderTzFormItem(item, isPreview)}
                    </Form.Item>
                )
            })}
            <Form.Item
                initialValue={props.fee}
                label="Send amount"
                name="sendAmount"
                required={true}
                rules={[
                    {
                        required: true,
                        message: 'Send amount is required'
                    }
                ]}
                validateTrigger="onBlur"
            >
                <InputNumber
                    readOnly={isPreview}
                    formatter={value => `ꜩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    min={props.fee}
                    parser={value => {
                        if (value) return value.replace(/\ꜩ\s?|(,*)/g, '');
                        else return 0;
                    }}
                    step={0.1}
                    style={{ width: '100%' }}
                />
            </Form.Item>
            <Form.Item
                style={{
                    marginBottom: '0',
                    textAlign: props.data.submit.center ? 'center' : undefined
                }}
            >
                <Button
                    block={props.data.submit.block}
                    htmlType="submit"
                    loading={submitting}
                    shape={props.data.submit.round ? 'round' : undefined}
                    style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                    type="primary"
                >
                    {confirming ? 'Confirming...' : props.data.submit.text || 'Submit'}
                </Button>
            </Form.Item>
        </Form>
    );
}

export default TzForm;