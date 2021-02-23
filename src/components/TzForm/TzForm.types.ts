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
    defaultValue?: string;
}

export interface TzFormData {
    submit: TzFormSubmit;
    items: TzFormItem[];
}

export interface TzFormProps {
    data: TzFormData;
    preview?: boolean;
}

export interface TzFormValues {
    [name: string]: number | string;
}