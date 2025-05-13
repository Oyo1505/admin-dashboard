import React from 'react';

interface SelectInputProps {
  optionsList: Array<{ value: string; label: Record<string, string> }>;
  formData?: Record<string, any>;
  defaultValue?: string;
  formDataKey: string;
  locale: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  optionsList,
  formData,
  defaultValue,
  formDataKey,
  locale,
  onChange,
  className = 'text-background',
}) => {
  return (
    <select 
      onChange={onChange} 
      defaultValue={defaultValue || formData?.[formDataKey]} 
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
};

export default SelectInput;