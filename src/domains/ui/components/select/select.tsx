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
  /** Must match the htmlFor of the associated <label> */
  id?: string;
}

const SelectInput = ({
  optionsList,
  formData,
  defaultValue,
  formDataKey,
  locale,
  onChange,
  className = 'text-background',
  id,
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
      id={id ?? `select-${formDataKey}`}
      onChange={onChange}
      // Controlled when bound to form data, so programmatic updates
      // (e.g. IMDb prefill) are reflected on screen
      {...(formData
        ? { value: getFormValue(formData, formDataKey) ?? '' }
        : { defaultValue })}
      className={clsx(
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'border border-input rounded-md px-3 py-2',
        className
      )}
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
