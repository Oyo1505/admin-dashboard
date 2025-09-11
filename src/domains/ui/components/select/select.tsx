import React, { memo } from 'react';

interface SelectInputProps<T = Record<string, unknown>> {
  optionsList: Array<{ value: string; label: Record<string, string> }>;
  formData?: T;
  defaultValue?: string;
  formDataKey: string;
  locale: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

const SelectInput = memo(
  ({
    optionsList,
    formData,
    defaultValue,
    formDataKey,
    locale,
    onChange,
    className = 'text-background',
  }: SelectInputProps) => {
    const getFormValue = (
      data: typeof formData,
      key: string
    ): string | undefined => {
      const value = data?.[key];
      return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : undefined;
    };

    return (
      <select
        onChange={onChange}
        defaultValue={defaultValue || getFormValue(formData, formDataKey)}
        className={className}
      >
        <option value=""> </option>
        {optionsList.map((option, index) => (
          <option
            key={`${option?.label?.[locale]}-${index}`}
            value={option?.value}
          >
            {option?.label?.[locale]}
          </option>
        ))}
      </select>
    );
  }
);
SelectInput.displayName = 'SelectInput';
export default SelectInput;
