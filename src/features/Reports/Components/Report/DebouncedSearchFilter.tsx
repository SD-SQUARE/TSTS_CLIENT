import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

interface Props {
    value: string | undefined;
    onChange: (val: string | undefined) => void;
    placeholder: string;
}

const DebouncedSearchInput: React.FC<Props> = ({ value, onChange, placeholder }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localValue, onChange, value]);

    return (
        <Input
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
    );
};

export default DebouncedSearchInput;