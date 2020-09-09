import React from 'react';
import './TextInput.scss';

interface IProps {
    key: string;
    label?: string;
    isPassword: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => any;
    inputStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
    barStyle?: React.CSSProperties;
    value?: string;
    disabled?: boolean;
}

const TextInput = (props: IProps) => {

    const {
        key,
        label,
        isPassword,
        onChange,
        onFocus,
        inputStyle,
        labelStyle,
        barStyle,
        value,
        disabled
    } = props;

    const getInputType = () => {
        return isPassword ? "password" : "text";
    };

    return (
        <div className="TextInput">
            <input
                value={!!value ? value : undefined}
                type={getInputType()}
                id={key}
                style={inputStyle}
                onChange={onChange ? onChange : undefined}
                onFocus={onFocus ? onFocus : undefined}
                disabled={disabled}
            />
            {!!label && <label
                htmlFor={key}
                style={labelStyle}
            >
                {label}
            </label>}
            <div
                className="Bar"
                style={barStyle}
            />
        </div>
    );
};

export default TextInput;
