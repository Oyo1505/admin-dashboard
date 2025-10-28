import clsx from 'clsx';
import React from 'react';

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

const SelectInput = ({
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
      id={`select-${formDataKey}`}
      onChange={onChange}
      defaultValue={defaultValue || getFormValue(formData, formDataKey)}
      className={clsx(
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'border border-input rounded-md px-3 py-2',
        className
      )}
      aria-label={formDataKey}
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
};

export default SelectInput;
