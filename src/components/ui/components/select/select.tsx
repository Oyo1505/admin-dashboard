import React from 'react';

interface SelectInputProps {
  optionsList: Array<{ value: string; label: Record<string, string> }>;
  formData: Record<string, any>;
  formDataKey: string;
  locale: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  optionsList,
  formData,
  formDataKey,
  locale,
  onChange,
  className = 'text-background',
}) => {
  return (
    <select 
      onChange={onChange} 
      defaultValue={formData?.[formDataKey]} 
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