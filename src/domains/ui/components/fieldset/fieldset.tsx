'use client';
import { ChangeEvent, useState } from 'react';
import { Input } from '../input/input';

const Fieldset = ({
  label,
  id,
  defaultValue,
}: {
  label: string;
  id: string;
  defaultValue?: string;
}) => {
  const [value, setValue] = useState<string>();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  return (
    <div className="mb-[15px] flex items-center gap-5">
      <label className="w-[90px] text-right text-[15px]" htmlFor={id}>
        {label}
      </label>
      <Input
        className="h-[35px] w-full flex-1 rounded-[4px] border border-gray-500 bg-white px-[10px] text-[15px] text-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-1"
        id={id}
        defaultValue={defaultValue}
        onChange={handleChange}
        value={value}
      />
    </div>
  );
};

export default Fieldset;
