import Button from 'antd/lib/button';
import Form, { Rule } from 'antd/lib/form';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import React, {
    useState
} from 'react';
import {
    TzFormItem,
    TzFormProps,
    TzFormValues
} from './TzForm.types';

function renderTzFormItem(item: TzFormItem) {
    switch (item.type) {
        case 'number':
            return <InputNumber style={{ width: '100%' }} />;
        case 'text':
            return <Input placeholder={item.placeholder} />;
        case 'textarea':
            return <Input.TextArea placeholder={item.placeholder} />;
    }
}

function TzForm(props: TzFormProps) {
    const [form] = Form.useForm<TzFormValues>();
    const [submitting, setSubmitting] = useState<boolean>(false);

    const initialValues: TzFormValues = {};
    props.data.items.forEach(item => {
        if (item.defaultValue) {
            switch (item.type) {
                case 'number':
                    initialValues[item.name] = parseFloat(item.defaultValue);
                    break;
                case 'text':
                case 'textarea':
                    initialValues[item.name] = item.defaultValue;
                    break;
            }
        }
    });

    return (
        <Form
            form={form}
            initialValues={initialValues}
            colon={false}
            requiredMark="optional"
            labelCol={{
                span: 24
            }}
            wrapperCol={{
                span: 24
            }}
            onFinish={async values => {
                if (!submitting) {
                    setSubmitting(true);
                    setSubmitting(false);
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
                        initialValue={item.defaultValue}
                        label={item.label}
                        name={item.name}
                        required={item.required}
                        rules={rules}
                        validateTrigger="onBlur"
                    >
                        {renderTzFormItem(item)}
                    </Form.Item>
                )
            })}
            <Form.Item
                style={{
                    marginBottom: '0',
                    textAlign: props.data.submit.center ? 'center' : undefined
                }}
            >
                <Button
                    block={props.data.submit.block}
                    htmlType="submit"
                    shape={props.data.submit.round ? 'round' : undefined}
                    style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                    type="primary"
                >
                    {props.data.submit.text || 'Submit'}
                </Button>
            </Form.Item>
        </Form>
    );
}

export default TzForm;